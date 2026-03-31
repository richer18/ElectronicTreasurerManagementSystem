import re
import subprocess
from datetime import datetime
from pathlib import Path


MODULE_DIR = Path(__file__).resolve().parents[1]
INPUT_SQL_FILE = MODULE_DIR / "SCRAPE_DATA_2" / "community_tax_certificate_payment_checked.sql"
OUTPUT_SQL_FILE = MODULE_DIR / "SCRAPE_SAVE" / "community_tax_certificate_payment_final.sql"
SETUP_SQL_FILE = MODULE_DIR / "setup_communitytaxcertificate.sql"
LOG_FILE = MODULE_DIR / "Logs" / "community_tax_certificate_payment_checker_2.log.txt"

MYSQL_EXE = Path(r"C:\xampp\mysql\bin\mysql.exe")
MYSQL_HOST = "192.168.101.109"
MYSQL_PORT = "3307"
MYSQL_DB = "zamboanguita_taxpayer"
MYSQL_USER = "root"
MYSQL_PASSWORD = ""

PAYMENT_KEY_PATTERN = re.compile(
    r"INSERT INTO community_tax_certificate_payment \((?P<columns>.+)\) VALUES \((?P<values>.+)\);",
    re.IGNORECASE,
)


def log(message: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


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
            paired.get("CTC_ID", ""),
            paired.get("CTCNO", ""),
            paired.get("DATEISSUED", ""),
            paired.get("CTCTYPE", ""),
        ]
    )


def import_to_mysql(sql_path: Path) -> None:
    command = [
        str(MYSQL_EXE),
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
    payload = setup_sql + "\nTRUNCATE TABLE community_tax_certificate_payment;\n\n" + import_sql
    subprocess.run(command, input=payload.encode("utf-8"), check=True)


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

    import_to_mysql(OUTPUT_SQL_FILE)
    log(f"Completed checker 2. unique_rows={len(seen_keys)}, duplicates={duplicates}")
    print(f"Processed {INPUT_SQL_FILE} -> {OUTPUT_SQL_FILE} and imported to MySQL")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
