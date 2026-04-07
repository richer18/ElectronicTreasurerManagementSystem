import argparse
import os
import sys
from datetime import date, datetime, time
from decimal import Decimal
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
PYTHON_PACKAGES = ROOT / ".python-packages"
if str(PYTHON_PACKAGES) not in sys.path:
    sys.path.insert(0, str(PYTHON_PACKAGES))
DATA_SCRAPER_DIR = ROOT / "run_file" / "DATA_SCRAPER"
if str(DATA_SCRAPER_DIR) not in sys.path:
    sys.path.insert(0, str(DATA_SCRAPER_DIR))

import fdb  # noqa: E402
from date_config import load_date_config  # noqa: E402


MODULE_DIR = Path(__file__).resolve().parent
SCRAPE_SAVE_DIR = MODULE_DIR / "SCRAPE_SAVE"
LOGS_DIR = MODULE_DIR / "Logs"
QUERY_FILE = MODULE_DIR / "general_fund_payment_query.sql"
OUTPUT_FILE = SCRAPE_SAVE_DIR / "general_fund_payment.sql"
LOG_FILE = LOGS_DIR / "general_fund_payment.log.txt"

DEFAULT_FDB = Path(r"E:\ZAMBOANGUITA.FDB")


def resolve_firebird_client() -> tuple[Path, Path]:
    env_value = os.environ.get("FIREBIRD_CLIENT")
    if env_value:
        candidate = Path(env_value).expanduser()
        if candidate.exists():
            return candidate.parent, candidate

    candidates = [
        (ROOT / ".tools" / "firebird-2.5.9", ROOT / ".tools" / "firebird-2.5.9" / "fbembed.dll"),
        (ROOT / ".tools" / "firebird-5.0.3", ROOT / ".tools" / "firebird-5.0.3" / "fbclient.dll"),
        (
            Path(r"D:\WINDOWS_INSTALLED\ElectronicTreasurerManagementSystem\.tools\firebird-2.5.9"),
            Path(r"D:\WINDOWS_INSTALLED\ElectronicTreasurerManagementSystem\.tools\firebird-2.5.9\fbembed.dll"),
        ),
        (
            Path(r"D:\WINDOWS_INSTALLED\ElectronicTreasurerManagementSystem\.tools\firebird-5.0.3"),
            Path(r"D:\WINDOWS_INSTALLED\ElectronicTreasurerManagementSystem\.tools\firebird-5.0.3\fbclient.dll"),
        ),
        (
            Path(r"C:\Program Files\Firebird\Firebird_2_5\bin"),
            Path(r"C:\Program Files\Firebird\Firebird_2_5\bin\fbclient.dll"),
        ),
        (
            Path(r"C:\Program Files\Firebird\Firebird_3_0"),
            Path(r"C:\Program Files\Firebird\Firebird_3_0\fbclient.dll"),
        ),
    ]

    for root_path, client_path in candidates:
        if client_path.exists():
            return root_path, client_path

    raise FileNotFoundError(
        "Firebird Client Library not found. Set FIREBIRD_CLIENT or install fbclient.dll in .tools."
    )


def log(message: str) -> None:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}"
    print(line)
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def load_firebird_client() -> None:
    firebird_root, firebird_client = resolve_firebird_client()
    os.environ["FIREBIRD_LOCK"] = str(ROOT / ".tools" / "firebird-lock")
    os.environ["FIREBIRD_TMP"] = str(ROOT / ".tools" / "firebird-tmp")
    os.environ["FIREBIRD"] = str(firebird_root)
    fdb.load_api(str(firebird_client))
    log(f"Using Firebird client: {firebird_client}")


def build_firebird_dsn(fdb_path: Path) -> str:
    return str(fdb_path) if fdb_path.exists() else f"localhost:{fdb_path}"


def sql_value(value) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, Decimal):
        return format(value, "f")
    if isinstance(value, datetime):
        return "'" + value.strftime("%Y-%m-%d %H:%M:%S") + "'"
    if isinstance(value, date):
        return "'" + value.strftime("%Y-%m-%d") + "'"
    if isinstance(value, time):
        return "'" + value.strftime("%H:%M:%S") + "'"
    if isinstance(value, bytes):
        return "0x" + value.hex()
    if isinstance(value, str):
        return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"
    return str(value)


def build_query(start_date: str | None, end_date: str | None) -> str:
    query = QUERY_FILE.read_text(encoding="utf-8")
    filters = []

    if start_date:
        filters.append(f"p.PAYMENTDATE >= '{start_date} 00:00:00'")
    if end_date:
        filters.append(f"p.PAYMENTDATE < DATEADD(1 DAY TO CAST('{end_date}' AS DATE))")

    if filters:
        query += "\nAND " + "\nAND ".join(filters)

    query += "\nORDER BY p.PAYMENTDATE DESC, p.RECEIPTNO DESC, pd.RECEIPTITEMORDER"
    return query


def export_sql(args: argparse.Namespace) -> None:
    load_firebird_client()
    query = build_query(args.start_date, args.end_date)

    dsn = build_firebird_dsn(args.fdb)
    log(f"Connecting to Firebird: {dsn}")
    connection = fdb.connect(
        dsn=dsn,
        user=args.fdb_user,
        password=args.fdb_password,
        charset="UTF8",
    )

    try:
        cursor = connection.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = [desc[0].strip() for desc in cursor.description]
    finally:
        connection.close()

    SCRAPE_SAVE_DIR.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open("w", encoding="utf-8") as handle:
        handle.write(f"-- Source: {args.fdb}\n")
        handle.write(f"-- Rows: {len(rows)}\n")
        if args.truncate:
            handle.write("TRUNCATE TABLE general_fund_payment;\n\n")

        column_sql = ", ".join(columns)
        for row in rows:
            values_sql = ", ".join(sql_value(value) for value in row)
            handle.write(
                f"INSERT INTO general_fund_payment ({column_sql}) VALUES ({values_sql});\n"
            )

    log(f"Exported {len(rows)} rows to {OUTPUT_FILE}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Scrape General Fund payment data from Firebird and save SQL INSERT statements."
    )
    parser.add_argument("--fdb", type=Path, default=DEFAULT_FDB)
    parser.add_argument("--fdb-user", default="SYSDBA")
    parser.add_argument("--fdb-password", default="masterkey")
    parser.add_argument("--start-date", help="Inclusive YYYY-MM-DD filter on PAYMENTDATE")
    parser.add_argument("--end-date", help="Inclusive YYYY-MM-DD filter on PAYMENTDATE")
    parser.add_argument("--truncate", action="store_true", help="Truncate target table before inserts")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    config = load_date_config()
    args.start_date = args.start_date or config.get("start_date")
    args.end_date = args.end_date or config.get("end_date")

    try:
        export_sql(args)
        return 0
    except Exception as exc:
        log(f"Failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
