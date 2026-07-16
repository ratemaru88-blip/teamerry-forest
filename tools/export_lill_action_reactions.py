from __future__ import annotations

import json
import shutil
import sys
import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUT_CSV = ROOT / "data" / "dialogue" / "Lill_Action_Reactions_v01.csv"
OUTPUT_JSON = ROOT / "data" / "export" / "lill_action_reactions.json"
DOCS_JSON = ROOT / "docs" / "data" / "export" / "lill_action_reactions.json"

EXPECTED_HEADERS = ["カテゴリ", "セットID", "順番", "セリフ", "有効", "備考"]


def normalize_text(value) -> str:
    return str(value).strip().lstrip("\ufeff") if value is not None else ""


def is_enabled(value) -> bool:
    if isinstance(value, bool):
        return value
    return normalize_text(value).upper() == "TRUE"


def parse_order(value, row_number: int) -> int:
    try:
        order = int(float(str(value)))
    except (TypeError, ValueError):
        raise ValueError(f"row {row_number}: 順番が数値ではありません: {value!r}") from None

    if order not in (1, 2, 3):
        raise ValueError(f"row {row_number}: 順番は1,2,3のみ有効です: {order}")

    return order


def export_reactions() -> dict:
    if not INPUT_CSV.exists():
        raise FileNotFoundError(f"入力CSVが存在しません: {INPUT_CSV}")

    grouped: dict[str, dict[str, dict[int, str]]] = defaultdict(lambda: defaultdict(dict))
    warnings: list[str] = []

    with INPUT_CSV.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = [normalize_text(header) for header in (reader.fieldnames or [])]
        if headers != EXPECTED_HEADERS:
            raise ValueError(f"ヘッダーが一致しません: {headers}")

        for row_number, row in enumerate(reader, start=2):
            if not any(normalize_text(value) for value in row.values()):
                continue

            if not is_enabled(row.get("有効")):
                continue

            category = normalize_text(row.get("カテゴリ"))
            set_id = normalize_text(row.get("セットID"))
            line = normalize_text(row.get("セリフ"))

            if not category or not set_id or not line:
                warnings.append(f"row {row_number}: 必須値不足のため除外")
                continue

            try:
                order = parse_order(row.get("順番"), row_number)
            except ValueError as error:
                warnings.append(str(error))
                continue

            grouped[category][set_id][order] = line

    reactions: dict[str, list[dict]] = {}
    for category, sets in grouped.items():
        reactions[category] = []
        for set_id, lines_by_order in sorted(sets.items()):
            missing = [order for order in (1, 2, 3) if order not in lines_by_order]
            if missing:
                warnings.append(f"{set_id}: 順番 {missing} が不足しているため除外")
                continue

            reactions[category].append({
                "setId": set_id,
                "lines": [lines_by_order[1], lines_by_order[2], lines_by_order[3]],
            })

    return {
        "version": "1.0",
        "source": INPUT_CSV.name,
        "updatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        "reactions": reactions,
        "warnings": warnings,
    }


def main() -> int:
    payload = export_reactions()
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    DOCS_JSON.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUTPUT_JSON, DOCS_JSON)

    set_count = sum(len(sets) for sets in payload["reactions"].values())
    line_count = sum(len(item["lines"]) for sets in payload["reactions"].values() for item in sets)
    print(f"Exported {set_count} reaction sets / {line_count} lines to {OUTPUT_JSON}")
    print(f"Copied reaction JSON to {DOCS_JSON}")
    if payload["warnings"]:
        print("Warnings:")
        for warning in payload["warnings"]:
            print(f"- {warning}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
