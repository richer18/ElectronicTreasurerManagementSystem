import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
INPUT_SQL_FILE = BASE_DIR / "SCRAPE_SAVE" / "general_fund_payment.sql"
OUTPUT_SQL_FILE = BASE_DIR / "SCRAPE_DATA_2" / "general_fund_payment_checked.sql"
LOG_FILE = BASE_DIR / "Logs" / "general_fund_payment_checker_1.log.txt"

INSERT_PATTERN = re.compile(
    r"^INSERT INTO general_fund_payment \((?P<columns>.+)\) VALUES \((?P<values>.+)\);$",
    re.IGNORECASE,
)


def normalize_insert_line(line: str) -> tuple[str, list[str]]:
    issues: list[str] = []
    stripped = line.strip()

    if not stripped:
        return line, issues

    match = INSERT_PATTERN.match(stripped)
    if not match:
        return line, issues

    columns = [column.strip() for column in match.group("columns").split(",")]
    values = match.group("values")

    if len(columns) != len(set(columns)):
        issues.append("duplicate columns detected")

    sanitized_line = stripped.replace("\x00", "")
    if sanitized_line != stripped:
        issues.append("removed null-byte characters")

    return sanitized_line + "\n", issues


def main() -> int:
    if not INPUT_SQL_FILE.exists():
        raise FileNotFoundError(f"Input SQL file not found: {INPUT_SQL_FILE}")

    OUTPUT_SQL_FILE.parent.mkdir(parents=True, exist_ok=True)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    issue_count = 0
    insert_count = 0

    with (
        INPUT_SQL_FILE.open("r", encoding="utf-8") as infile,
        OUTPUT_SQL_FILE.open("w", encoding="utf-8") as outfile,
        LOG_FILE.open("w", encoding="utf-8") as logfile,
    ):
        for line_number, line in enumerate(infile, start=1):
            normalized_line, issues = normalize_insert_line(line)
            outfile.write(normalized_line)

            if normalized_line.lstrip().upper().startswith("INSERT INTO GENERAL_FUND_PAYMENT"):
                insert_count += 1

            for issue in issues:
                issue_count += 1
                logfile.write(f"Line {line_number}: {issue}\n")

        logfile.write(f"\nChecked inserts: {insert_count}\n")
        logfile.write(f"Logged issues: {issue_count}\n")

    print(f"Processed {INPUT_SQL_FILE} -> {OUTPUT_SQL_FILE}")
    print(f"Log written to {LOG_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
