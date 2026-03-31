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
FIREBIRD_CLIENT = Path(r"C:\Program Files\Firebird\Firebird_2_5\bin\fbclient.dll")
FIREBIRD_ROOT = FIREBIRD_CLIENT.parent.parent

DEFAULT_FDB = Path(r"E:\ZAMBOANGUITA.FDB")


def log(message: str) -> None:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}"
    print(line)
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def load_firebird_client() -> None:
    if not FIREBIRD_CLIENT.exists():
        raise FileNotFoundError(f"Firebird client not found: {FIREBIRD_CLIENT}")

    os.environ["FIREBIRD"] = str(FIREBIRD_ROOT)
    os.environ["FIREBIRD_LOCK"] = str(ROOT / ".tools" / "firebird-lock")
    os.environ["FIREBIRD_TMP"] = str(ROOT / ".tools" / "firebird-tmp")
    fdb.load_api(str(FIREBIRD_CLIENT))


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

    log(f"Connecting to Firebird: localhost:{args.fdb}")
    connection = fdb.connect(
        dsn=f"localhost:{args.fdb}",
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
