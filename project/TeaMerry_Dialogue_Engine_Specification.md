# TeaMerry Dialogue Engine Specification Ver.1.0

作成日: 2026-07-08

---

# 1. 目的

TeaMerry Forest における Dialogue Engine（セリフ表示システム）の正式仕様を定義する。

本仕様書は、セリフデータの管理方法、選択ルール、表示フロー、および実装時の基準を定める。

本仕様書は実装仕様ではなく、Dialogue Engine 全体の設計仕様書とする。

---

# 2. 適用範囲

本仕様書は以下に適用する。

- TeaMerry Forest
- Dialogue Spreadsheet
- Dialogue JSON
- Dialogue Engine
- キャラクター会話
- 森のささやき
- システムメッセージ
- ナレーション

---

# 3. Single Source of Truth

Dialogue データの正式管理は以下とする。

| 種類 | 用途 |
|------|------|
| Google Spreadsheet | 編集用 |
| Excel | 正式保存用 |
| JSON | 実装用 Export |
| TSV | Export |
| CSV | Export |

正式保存先

```text
data/dialogue/TeaMerry_Dialogue_Spreadsheet_Template.xlsx
```

Spreadsheet を唯一の編集元とし、Export データは編集しない。

---

# 4. Spreadsheet構成

正式シート

- Mint
- Lil
- Elder
- Maroud
- Forest
- Other
- README

全シート共通で11列構成とする。

---

# 5. データ構造

|列|内容|
|---|---|
|セリフID|一意ID|
|表示種別|character / narration / system|
|キャラクター|話者|
|場所|表示場所|
|章|分類|
|条件|表示条件|
|トーン|雰囲気|
|優先度|表示優先|
|セリフ本文|表示文章|
|有効|ON / OFF|
|備考|管理用|

列構成は全シート共通とする。

---

# 6. データルール

## 場所

空欄

↓

全場所対象

---

## 条件

空欄

↓

条件なし

常時表示候補

---

条件は

カンマ区切り

例

```text
朝
```

```text
夜,霧
```

```text
返信あり
```

複数条件はすべて一致した場合のみ有効。

---

## 優先度

|値|用途|
|---|---|
|100|最優先|
|90|特殊条件|
|80|イベント|
|70|時間帯・天候|
|60|場所限定|
|50|通常会話|

---

# 7. 表示フロー

Dialogue Engine は以下の順で判定する。

```text
Spreadsheet読込

↓

有効 = ON

↓

表示種別判定

↓

場所判定

↓

条件判定

↓

優先度判定

↓

候補抽出

↓

ランダム選択

↓

表示
```

---

# 8. 表示種別

## character

キャラクター会話。

吹き出しで表示する。

---

## narration

画面演出用ナレーション。

---

## system

通知・説明・システムメッセージ。

---

# 9. Forest シート

Forest シートは

「森のささやき」

専用データとする。

表示例

- 森を歩く
- 一定時間経過
- イベント発生
- 季節演出
- 天候変化

キャラクターには属さない。

---

# 10. Character シート

各キャラクターシートは

それぞれのキャラクター専用会話を管理する。

対象

- Mint
- Lil
- Elder
- Maroud

---

# 11. Other シート

Other は共通会話を管理する。

例

- システム
- 共通ナレーション
- 将来追加される共通データ

---

# 12. JSON Export

Spreadsheet

↓

JSON Export

↓

Dialogue Engine

JSON は Export データであり編集しない。

---

# 13. エラー処理

候補が存在しない場合

優先順位

1. Other

2. Forest

3. 表示しない

エラー終了は行わない。

---

# 14. 将来拡張

将来追加予定

- 感情タグ
- 表情
- モーション
- ボイス
- SE指定
- BGM指定
- 季節イベント
- 好感度条件
- ストーリー進行条件

列追加ではなく、必要に応じて設計を見直す。

---

# 15. AI運用

AI は以下を遵守する。

- Spreadsheet を編集元とする。
- JSON を編集しない。
- Export を編集しない。
- 新しい列は勝手に追加しない。
- 既存11列構成を維持する。
- Governance に従う。
- Single Source of Truth に従う。

---

# 16. 関連資料

参照順

1. TeaMerry_Project_Governance.md

2. TeaMerry_Single_Source_of_Truth.md

3. TeaMerry_Master_Classification.md

4. TeaMerry_Dialogue_Spreadsheet_Template.xlsx

5. 本仕様書

---

# 17. Dialogue Engine v1.0 完了記録

作成日: 2026-07-09

Dialogue Engine v1.0 として、以下の実装・運用整理を完了した。

- Phase6〜Phase10 実装完了
- Export Tool 実装完了
- 正式JSON運用開始
- 星風テラス表記統一完了

実行コマンド:

```text
python tools/export_dialogue.py
```

正式Export JSON:

```text
data/export/dialogue.json
```

公開JSON:

```text
WEBSITE（ホームページ）/新HP_Tea Merry Forest/data/export/dialogue.json
```

既知仕様:

- Dialogue Engine は文言選択を担当する。
- 各ページJSは表示演出を担当する。
- JSON は Export データであり、直接編集しない。
- Spreadsheet / Excel を編集・保存元とし、Export Tool により JSON を生成する。

---

# 18. バージョン

Ver.1.0

初版

Dialogue Engine の正式設計仕様書として制定する。
