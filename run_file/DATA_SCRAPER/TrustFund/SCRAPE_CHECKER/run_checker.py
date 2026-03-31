import subprocess
import sys
from pathlib import Path


MODULE_DIR = Path(__file__).resolve().parent


def run(script_name: str) -> None:
    script_path = MODULE_DIR / script_name
    print(f"Running {script_name}...")
    subprocess.run([sys.executable, str(script_path)], check=True)
    print(f"Finished {script_name}.")


def main() -> int:
    run("SQL_CHECKER_TRUSTFUND.py")
    print()
    run("SQL_CHECKER_TRUSTFUND_2.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
