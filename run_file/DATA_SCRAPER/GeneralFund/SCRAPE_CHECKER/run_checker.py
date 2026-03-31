import os
import subprocess
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def run_script(script_name: str) -> None:
    script_path = BASE_DIR / script_name
    print(f"Running {script_path.name}...")
    subprocess.run([sys.executable, str(script_path)], check=True)
    print(f"Finished {script_path.name}.\n")


def main() -> int:
    os.chdir(BASE_DIR)
    run_script("SQL_CHECKER_GENERALFUND.py")
    run_script("SQL_CHECKER_GENERALFUND_2.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
