import re
import subprocess
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
INPUT_SQL_FILE = BASE_DIR / "SCRAPE_DATA_2" / "general_fund_payment_checked.sql"
OUTPUT_SQL_FILE = BASE_DIR / "SCRAPE_SAVE" / "general_fund_payment_final.sql"
LOG_FILE = BASE_DIR / "Logs" / "general_fund_payment_checker_2.log.txt"
SETUP_FILE = BASE_DIR / "setup_general_fund_payment.sql"
MYSQL_EXE = Path(r"C:\xampp\mysql\bin\mysql.exe")
MYSQL_HOST = "192.168.101.109"
MYSQL_PORT = "3307"
MYSQL_DB = "zamboanguita_taxpayer"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""

PAYMENTDETAIL_PATTERN = re.compile(
    r"INSERT INTO general_fund_payment \(.+PAYMENTDETAIL_ID.+\) VALUES \((?P<values>.+)\);",
    re.IGNORECASE,
)


def extract_values_segment(line: str) -> str | None:
    start = line.find("VALUES (")
    end = line.rfind(");")
    if start == -1 or end == -1:
        return None
    return line[start + len("VALUES ("):end]


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


def import_to_mysql() -> None:
    if not MYSQL_EXE.exists():
        raise FileNotFoundError(f"MySQL client not found: {MYSQL_EXE}")

    if not SETUP_FILE.exists():
        raise FileNotFoundError(f"Setup SQL file not found: {SETUP_FILE}")

    command = [
        str(MYSQL_EXE),
        f"--host={MYSQL_HOST}",
        f"--port={MYSQL_PORT}",
        "--default-character-set=utf8mb4",
        f"--user={MYSQL_USER}",
        MYSQL_DB,
    ]

    if MYSQL_PASSWORD != "":
        command.insert(4, f"--password={MYSQL_PASSWORD}")

    setup_sql = SETUP_FILE.read_text(encoding="utf-8").encode("utf-8")
    subprocess.run(command, input=setup_sql, check=True)

    import_sql = (
        "TRUNCATE TABLE general_fund_payment;\n\n"
        + OUTPUT_SQL_FILE.read_text(encoding="utf-8")
    ).encode("utf-8")
    subprocess.run(command, input=import_sql, check=True)


def main() -> int:
    if not INPUT_SQL_FILE.exists():
        raise FileNotFoundError(f"Input SQL file not found: {INPUT_SQL_FILE}")

    seen_paymentdetail_ids: set[str] = set()
    duplicate_count = 0
    insert_count = 0

    with (
        INPUT_SQL_FILE.open("r", encoding="utf-8") as infile,
        OUTPUT_SQL_FILE.open("w", encoding="utf-8") as outfile,
        LOG_FILE.open("w", encoding="utf-8") as logfile,
    ):
        for line_number, line in enumerate(infile, start=1):
            if not line.lstrip().upper().startswith("INSERT INTO GENERAL_FUND_PAYMENT"):
                outfile.write(line)
                continue

            values_segment = extract_values_segment(line.strip())
            if not values_segment:
                outfile.write(line)
                continue

            values = split_sql_values(values_segment)
            if len(values) < 2:
                outfile.write(line)
                logfile.write(f"Line {line_number}: unable to parse PAYMENTDETAIL_ID\n")
                continue

            paymentdetail_id = values[1].strip("'")
            if paymentdetail_id in seen_paymentdetail_ids:
                duplicate_count += 1
                logfile.write(
                    f"Line {line_number}: duplicate PAYMENTDETAIL_ID skipped -> {paymentdetail_id}\n"
                )
                continue

            seen_paymentdetail_ids.add(paymentdetail_id)
            insert_count += 1
            outfile.write(line)

        logfile.write(f"\nFinal insert count: {insert_count}\n")
        logfile.write(f"Duplicates skipped: {duplicate_count}\n")

        import_to_mysql()
        logfile.write("MySQL import: success\n")

    print(f"Processed {INPUT_SQL_FILE} -> {OUTPUT_SQL_FILE}")
    print(f"Log written to {LOG_FILE}")
    print("Imported general_fund_payment_final.sql into MySQL table general_fund_payment")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
