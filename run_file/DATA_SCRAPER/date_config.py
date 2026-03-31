import json
from pathlib import Path


CONFIG_FILE = Path(__file__).resolve().parent / "scraper_dates.json"


def load_date_config() -> dict:
    if not CONFIG_FILE.exists():
        return {}

    with CONFIG_FILE.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    if not isinstance(data, dict):
        return {}

    return data
