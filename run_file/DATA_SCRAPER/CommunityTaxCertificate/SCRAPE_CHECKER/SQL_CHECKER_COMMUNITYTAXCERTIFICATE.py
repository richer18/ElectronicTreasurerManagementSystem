import re
from datetime import datetime
from pathlib import Path


MODULE_DIR = Path(__file__).resolve().parents[1]
INPUT_SQL_FILE = MODULE_DIR / "SCRAPE_SAVE" / "community_tax_certificate_payment.sql"
OUTPUT_SQL_FILE = MODULE_DIR / "SCRAPE_DATA_2" / "community_tax_certificate_payment_checked.sql"
LOG_FILE = MODULE_DIR / "Logs" / "community_tax_certificate_payment_checker_1.log.txt"

INSERT_PATTERN = re.compile(
    r"^INSERT INTO community_tax_certificate_payment \((?P<columns>.+)\) VALUES \((?P<values>.+)\);$",
    re.IGNORECASE,
)
NULL_PATTERN = re.compile(r"\bNULL\b", re.IGNORECASE)


def log(message: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(f"[{timestamp}] {message}\n")


def main() -> int:
    if not INPUT_SQL_FILE.exists():
        raise FileNotFoundError(f"Input SQL file not found: {INPUT_SQL_FILE}")

    OUTPUT_SQL_FILE.parent.mkdir(parents=True, exist_ok=True)
    LOG_FILE.write_text("", encoding="utf-8")

    total_lines = 0
    fixed_null_lines = 0
    malformed_lines = 0

    with INPUT_SQL_FILE.open("r", encoding="utf-8") as infile, OUTPUT_SQL_FILE.open(
        "w", encoding="utf-8"
    ) as outfile:
        for raw_line in infile:
            total_lines += 1
            line = raw_line.rstrip("\n")

            if not line.startswith("INSERT INTO community_tax_certificate_payment"):
                outfile.write(raw_line)
                continue

            if not INSERT_PATTERN.match(line):
                malformed_lines += 1
                log(f"Malformed INSERT kept as-is: {line}")
                outfile.write(raw_line)
                continue

            fixed_line = NULL_PATTERN.sub("0", line)
            if fixed_line != line:
                fixed_null_lines += 1
                log(f"NULL replaced with 0: {line}")

            outfile.write(fixed_line + "\n")

    log(
        f"Completed checker 1. lines={total_lines}, null_replacements={fixed_null_lines}, malformed={malformed_lines}"
    )
    print(f"Processed {INPUT_SQL_FILE} -> {OUTPUT_SQL_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
