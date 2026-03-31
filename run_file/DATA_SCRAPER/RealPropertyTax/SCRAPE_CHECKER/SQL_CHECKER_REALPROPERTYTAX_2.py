import re
import subprocess
from datetime import datetime
from pathlib import Path


MODULE_DIR = Path(__file__).resolve().parents[1]
INPUT_SQL_FILE = MODULE_DIR / "SCRAPE_DATA_2" / "real_property_tax_payment_checked.sql"
OUTPUT_SQL_FILE = MODULE_DIR / "SCRAPE_SAVE" / "real_property_tax_payment_final.sql"
SETUP_SQL_FILE = MODULE_DIR / "setup_real_property_tax_payment.sql"
LOG_FILE = MODULE_DIR / "Logs" / "real_property_tax_payment_checker_2.log.txt"

MYSQL_EXE = Path(r"C:\xampp\mysql\bin\mysql.exe")
MYSQL_EXE_FALLBACK = Path(r"D:\WINDOWS_INSTALLED\xampp\mysql\bin\mysql.exe")
MYSQL_HOST = "192.168.101.109"
MYSQL_PORT = "3307"
MYSQL_DB = "zamboanguita_taxpayer"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""

PAYMENT_KEY_PATTERN = re.compile(
    r"INSERT INTO real_property_tax_payment \((?P<columns>.+)\) VALUES \((?P<values>.+)\);",
    re.IGNORECASE,
)

DISABLE_RPT_TRIGGERS_SQL = """
DROP TRIGGER IF EXISTS trg_full_report_rpt_ai;
DROP TRIGGER IF EXISTS trg_full_report_rpt_au;
DROP TRIGGER IF EXISTS trg_full_report_rpt_ad;
"""

RESTORE_RPT_TRIGGERS_SQL = """
CREATE TRIGGER trg_full_report_rpt_ai
AFTER INSERT ON real_property_tax_payment
FOR EACH ROW
CALL refresh_full_report_rcd_for_date(NEW.DATE);

CREATE TRIGGER trg_full_report_rpt_au
AFTER UPDATE ON real_property_tax_payment
FOR EACH ROW
CALL refresh_full_report_rcd_for_date(NEW.DATE);

CREATE TRIGGER trg_full_report_rpt_ad
AFTER DELETE ON real_property_tax_payment
FOR EACH ROW
CALL refresh_full_report_rcd_for_date(OLD.DATE);
"""


def log(message: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


def resolve_mysql_exe() -> Path:
    if MYSQL_EXE.exists():
        return MYSQL_EXE
    if MYSQL_EXE_FALLBACK.exists():
        return MYSQL_EXE_FALLBACK
    raise FileNotFoundError(
        f"MySQL executable not found. Checked: {MYSQL_EXE} and {MYSQL_EXE_FALLBACK}"
    )


def split_sql_values(values_segment: str) -> list[str]:
    values = []
    current = []
    in_string = False
    i = 0

    while i < len(values_segment):
        char = values_segment[i]

        if char == "'":
            current.append(char)
            if in_string and i + 1 < len(values_segment) and values_segment[i + 1] == "'":
                current.append(values_segment[i + 1])
                i += 1
            else:
                in_string = not in_string
        elif char == "," and not in_string:
            values.append("".join(current).strip())
            current = []
        else:
            current.append(char)
        i += 1

    values.append("".join(current).strip())
    return values


def extract_key(line: str) -> str | None:
    match = PAYMENT_KEY_PATTERN.match(line.strip())
    if not match:
        return None

    columns = [part.strip() for part in match.group("columns").split(",")]
    values = split_sql_values(match.group("values"))
    paired = dict(zip(columns, values))

    return "|".join(
        [
            paired.get("DATE", ""),
            paired.get("OR_NO", ""),
            paired.get("PIN", ""),
            paired.get("NAME_OF_BARANGAY", ""),
            paired.get("PROPERTY_CLASSIFICATION", ""),
            paired.get("BASIC_AND_SEF", ""),
        ]
    )


def import_to_mysql(sql_path: Path) -> None:
    mysql_exe = resolve_mysql_exe()
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
    payload = (
        setup_sql
        + "\n"
        + DISABLE_RPT_TRIGGERS_SQL
        + "\nTRUNCATE TABLE real_property_tax_payment;\n\n"
        + import_sql
        + "\n"
        + RESTORE_RPT_TRIGGERS_SQL
    )
    subprocess.run(command, input=payload.encode("utf-8"), check=True, capture_output=True)


def main() -> int:
    if not INPUT_SQL_FILE.exists():
        raise FileNotFoundError(f"Input SQL file not found: {INPUT_SQL_FILE}")

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

    try:
        import_to_mysql(OUTPUT_SQL_FILE)
        log(f"Completed checker 2. unique_rows={len(seen_keys)}, duplicates={duplicates}, imported=1")
        print(f"Processed {INPUT_SQL_FILE} -> {OUTPUT_SQL_FILE} and imported to MySQL")
        return 0
    except subprocess.CalledProcessError as exc:
        stderr_text = exc.stderr.decode("utf-8", errors="replace") if exc.stderr else ""
        stdout_text = exc.stdout.decode("utf-8", errors="replace") if exc.stdout else ""
        log(f"MySQL import failed. stdout={stdout_text.strip()} stderr={stderr_text.strip()}")
        raise
    except Exception as exc:
        log(f"MySQL import failed: {exc}")
        raise


if __name__ == "__main__":
    raise SystemExit(main())
