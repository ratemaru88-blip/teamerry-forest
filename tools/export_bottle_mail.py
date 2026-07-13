from __future__ import annotations

import json
import shutil
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
INPUT_XLSX = ROOT / "data" / "bottle_mail" / "TeaMerry 漂着ボトルメールマスター Ver.1.xlsx"
OUTPUT_JSON = ROOT / "data" / "export" / "drift_bottle_messages.json"
WEBSITE_JSON = (
    ROOT
    / "WEBSITE（ホームページ）"
    / "新HP_Tea Merry Forest"
    / "data"
    / "export"
    / "drift_bottle_messages.json"
)
DOCS_JSON = ROOT / "docs" / "data" / "export" / "drift_bottle_messages.json"
WEBSITE_DOCS_JSON = (
    ROOT
    / "WEBSITE（ホームページ）"
    / "新HP_Tea Merry Forest"
    / "docs"
    / "data"
    / "export"
    / "drift_bottle_messages.json"
)

EXPECTED_HEADERS = [
    "メールID",
    "表示名",
    "カテゴリ",
    "本文",
    "長さ",
    "今日のほっこり",
    "ほっこり枠",
    "奇抜度",
    "関連タグ",
    "有効",
    "備考",
]


def normalize_text(value) -> str:
    return str(value).strip() if value is not None else ""


def parse_on(value) -> bool:
    return normalize_text(value).upper() == "ON"


def parse_number(value) -> int | float:
    text = normalize_text(value)
    if not text:
        return 0

    number = float(text)
    return int(number) if number.is_integer() else number


def parse_tags(value) -> list[str]:
    text = normalize_text(value)
    if not text:
        return []

    return [item.strip() for item in text.split(",") if item.strip()]


def find_header_row(sheet) -> tuple[int, list[str]]:
    for row_number, row in enumerate(sheet.iter_rows(values_only=True), start=1):
        values = [normalize_text(value) for value in row]
        if values[: len(EXPECTED_HEADERS)] == EXPECTED_HEADERS:
            return row_number, values[: len(EXPECTED_HEADERS)]

    raise ValueError("ヘッダー行が見つかりません")


def build_messages(workbook):
    sheet = workbook[workbook.sheetnames[0]]
    header_row, headers = find_header_row(sheet)
    messages: list[dict] = []
    warnings: list[str] = []
    excluded_counts: Counter[str] = Counter()
    seen_ids: dict[str, int] = {}
    duplicate_ids: list[str] = []

    for row_number, row in enumerate(
        sheet.iter_rows(min_row=header_row + 1, max_col=len(headers), values_only=True),
        start=header_row + 1,
    ):
        values = {headers[index]: row[index] for index in range(len(headers))}
        if not any(normalize_text(value) for value in values.values()):
            excluded_counts["空行"] += 1
            continue

        message_id = normalize_text(values["メールID"])
        text = normalize_text(values["本文"])
        enabled = parse_on(values["有効"])

        if not message_id:
            excluded_counts["メールIDなし"] += 1
            continue

        if message_id in seen_ids:
            duplicate_ids.append(message_id)
            excluded_counts["ID重複"] += 1
            continue
        seen_ids[message_id] = row_number

        if not text:
            excluded_counts["本文なし"] += 1
            continue

        if not enabled:
            excluded_counts["有効OFF"] += 1
            continue

        if len(text) > 100:
            excluded_counts["100文字超過"] += 1
            warnings.append(f"{message_id}: 本文が100文字を超えたため除外")
            continue

        display_name = normalize_text(values["表示名"]) or "おさんぽさん"
        message = {
            "id": message_id,
            "displayName": display_name,
            "category": normalize_text(values["カテゴリ"]),
            "text": text,
            "lengthClass": normalize_text(values["長さ"]),
            "todayHokkori": parse_on(values["今日のほっこり"]),
            "hokkoriSlot": normalize_text(values["ほっこり枠"]),
            "oddity": parse_number(values["奇抜度"]),
            "tags": parse_tags(values["関連タグ"]),
            "enabled": enabled,
            "note": normalize_text(values["備考"]),
        }
        messages.append(message)

    if duplicate_ids:
        warnings.append("ID重複: " + ", ".join(sorted(set(duplicate_ids))))

    return messages, warnings, excluded_counts


def write_json(messages: list[dict]) -> None:
    payload = {
        "version": "1.0",
        "source": INPUT_XLSX.name,
        "updatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        "messages": messages,
    }

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for copy_path in [WEBSITE_JSON, DOCS_JSON, WEBSITE_DOCS_JSON]:
        copy_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(OUTPUT_JSON, copy_path)


def main() -> int:
    if not INPUT_XLSX.exists():
        print(f"入力Excelが存在しません: {INPUT_XLSX}", file=sys.stderr)
        return 1

    workbook = load_workbook(INPUT_XLSX, read_only=True, data_only=True)
    try:
        messages, warnings, excluded_counts = build_messages(workbook)
    finally:
        workbook.close()

    write_json(messages)

    print(f"Exported {len(messages)} drift bottle messages to {OUTPUT_JSON}")
    print(f"Copied drift bottle JSON to {WEBSITE_JSON}")
    print(f"Copied drift bottle JSON to {DOCS_JSON}")
    print(f"Copied drift bottle JSON to {WEBSITE_DOCS_JSON}")
    if excluded_counts:
        details = ", ".join(f"{key}: {value}" for key, value in sorted(excluded_counts.items()))
        print(f"Excluded: {details}")
    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"- {warning}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
