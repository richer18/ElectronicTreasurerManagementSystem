import re
import subprocess
from datetime import datetime
from pathlib import Path


MODULE_DIR = Path(__file__).resolve().parents[1]
INPUT_SQL_FILE = MODULE_DIR / "SCRAPE_DATA_2" / "trust_fund_payment_checked.sql"
OUTPUT_SQL_FILE = MODULE_DIR / "SCRAPE_SAVE" / "trust_fund_payment_final.sql"
SETUP_SQL_FILE = MODULE_DIR / "setup_trust_fund_payment.sql"
LOG_FILE = MODULE_DIR / "Logs" / "trust_fund_payment_checker_2.log.txt"

MYSQL_EXE_CANDIDATES = (
    Path(r"C:\xampp\mysql\bin\mysql.exe"),
    Path(r"D:\WINDOWS_INSTALLED\xampp\mysql\bin\mysql.exe"),
)
MYSQL_HOST = "192.168.101.109"
MYSQL_PORT = "3307"
MYSQL_DB = "zamboanguita_taxpayer"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""

PAYMENT_KEY_PATTERN = re.compile(
    r"INSERT INTO trust_fund_payment \((?P<columns>.+)\) VALUES \((?P<values>.+)\);",
    re.IGNORECASE,
)


def log(message: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


def extract_key(line: str) -> str | None:
    match = PAYMENT_KEY_PATTERN.match(line.strip())
    if not match:
        return None

    columns = [part.strip() for part in match.group("columns").split(",")]
    values = [part.strip() for part in match.group("values").split(",")]
    paired = dict(zip(columns, values))

    return "|".join(
        [
            paired.get("DATE", ""),
            paired.get("RECEIPT_NO", ""),
            paired.get("TYPE_OF_RECEIPT", ""),
        ]
    )


def import_to_mysql(sql_path: Path) -> None:
    mysql_exe = next((path for path in MYSQL_EXE_CANDIDATES if path.exists()), None)
    if mysql_exe is None:
        raise FileNotFoundError("mysql.exe not found in expected XAMPP locations")

    command = [
        str(mysql_exe),
        f"--host={MYSQL_HOST}",
        f"--port={MYSQL_PORT}",
        "--default-character-set=utf8mb4",
        f"--user={MYSQL_USER}",
        MYSQL_DB,
    ]
    if MYSQL_PASSWORD:
        command.insert(5, f"--password={MYSQL_PASSWORD}")

    setup_sql = SETUP_SQL_FILE.read_text(encoding="utf-8")
    import_sql = sql_path.read_text(encoding="utf-8")
    payload = setup_sql + "\nTRUNCATE TABLE trust_fund_payment;\n\n" + import_sql
    result = subprocess.run(
        command,
        input=payload.encode("utf-8"),
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        stdout = result.stdout.decode("utf-8", errors="replace")
        stderr = result.stderr.decode("utf-8", errors="replace")
        log(f"MySQL import failed. stdout={stdout} stderr={stderr}")
        raise subprocess.CalledProcessError(
            result.returncode,
            command,
            output=result.stdout,
            stderr=result.stderr,
        )


def main() -> int:
    LOG_FILE.write_text("", encoding="utf-8")
    seen_keys: set[str] = set()
    duplicates = 0

    with INPUT_SQL_FILE.open("r", encoding="utf-8") as infile, OUTPUT_SQL_FILE.open(
        "w", encoding="utf-8"
    ) as outfile:
        for raw_line in infile:
            key = extract_key(raw_line)
            if key is None:
                outfile.write(raw_line)
                continue

            if key in seen_keys:
                duplicates += 1
                log(f"Duplicate skipped for key={key}: {raw_line.strip()}")
                continue

            seen_keys.add(key)
            outfile.write(raw_line)

    import_to_mysql(OUTPUT_SQL_FILE)
    log(f"Completed checker 2. unique_rows={len(seen_keys)}, duplicates={duplicates}")
    print(f"Processed {INPUT_SQL_FILE} -> {OUTPUT_SQL_FILE} and imported to MySQL")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
