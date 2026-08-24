# TBalance Core / Compatibility Specification 1.0

Ver.2026-08-24 / Formal 1.0

この文書は、TBalance Core / Compatibility Specification 1.0の正式版です。目的は、TBalanceを特定Project専用ではなく、Standard Webと安全に接続できる汎用Coreとして成立させることです。

この1.0はTBalance Editor Ver.1とは別概念です。TBalance App Version、Compatibility Specification Version、Adapter Version、Safe Change Instruction Versionは分けて管理します。

## 1. Coreの目的

TBalance Coreは、Webページの見た目、構造、編集可能範囲、AI共有情報を安全に扱うための共通仕様です。

CoreはProject固有のページ名、リンク、Behaviorを知りません。Project固有情報はAdapterへ分離します。

TBalanceが扱う主な領域:

- Canvas / Stage
- Page
- Viewport
- Layer
- Hit Area
- Link
- Markup
- Memo
- AI Shared State
- Compatibility Diagnosis
- Safe Change Instruction

TBalance Coreがしないこと:

- 不明な既存HTML / CSS / JSを勝手に書き換えない
- 不明なBehaviorを再生成しない
- manifestを第二の `.tbalance` にしない
- Analyzer Resultをそのままmanifestへ確定しない
- Safe Change Instructionを毎回恒久ファイルとして量産しない
- UI色やProject固有表示へ依存しない

## 2. Entry Type

TBalanceへ入るPageは4区分に分けます。

### Native

TBalanceで新規作成されたPageです。TBalanceがCanvas、Layer、Layout、Hit Area、Linkを最初から管理します。

### Compatible

外部AI、Builder、他Editorで作成されたが、TBalance Compatibility Specificationに従っているPageです。

### Known Existing

既存HTML / CSS / JSがあり、Project Adapterまたは人間 / Agentが構造を把握しているPageです。

### Unknown Existing

TBalance情報を持たない一般的な既存HTML / CSS / JSです。初期状態はRead Onlyです。

## 3. Source Authority

Source Authorityは、Page単位で「どちらを正本にするか」を示します。Entry Typeとは別概念です。

初期値は増やしすぎず、基本は以下2つにします。

- `tbalance`
- `standard-web`

Entry Typeとの関係:

| Entry Type | Source Authority |
| --- | --- |
| native | tbalance |
| compatible | tbalance または standard-web |
| known-existing | standard-web |
| unknown-existing | standard-web |

Property単位Authorityは現段階では導入しません。特殊ComponentはProtected Behaviorで保護します。

## 4. `.tbalance` と manifestの役割

### `.tbalance`

TBalance Editorの編集状態です。

主な対象:

- Canvas / Stage
- Layer
- Viewport別Layout
- Editor状態
- TBalance内Revision
- Native Pageの編集Source

### `tbalance.manifest.json`

Standard WebとTBalanceの接続情報です。

主な対象:

- Compatibility Spec Version
- Project ID
- Adapter
- Page Source
- Source Authority
- Component Mapping
- Editable / Protected Properties
- Behavior Reference

manifestに入れないもの:

- 大量の座標情報
- Undo履歴
- AI履歴
- Screenshot
- Editor UI状態
- 一時Diff
- Analyzer Result
- Safe Change Instruction履歴
- TeaMerryなどProject固有の固定情報

manifestは第二の `.tbalance` ではありません。

## 5. manifest最小Schema

基本方針:

```text
1 Project = 1 tbalance.manifest.json
```

配置:
サイトRootまたはTBalance Project Root。

1.0 Schema:

```json
{
  "compatibilitySpecVersion": "1.0",
  "projectId": "example-project",
  "adapter": {
    "id": "generic",
    "version": "1.0",
    "capabilities": {
      "pages": true,
      "links": true,
      "componentMapping": true,
      "protectedBehavior": true,
      "patch": false
    }
  },
  "pages": [
    {
      "pageId": "landing",
      "sourcePath": "landing.html",
      "sourceAuthority": "standard-web",
      "components": [
        {
          "tbId": "primary-action",
          "role": "button",
          "editableProperties": ["position", "size", "text"],
          "protectedProperties": ["behavior"],
          "behaviorRef": "primary-action-click"
        }
      ]
    }
  ]
}
```

## 6. manifest項目分類

Required:

- `compatibilitySpecVersion`
- `projectId`
- `pages[]`
- `pages[].pageId`
- `pages[].sourceAuthority`

Conditional:

- `adapter`: `generic` 以外、またはProject Adapterを使う場合。明示性のため `generic` でも推奨。
- `adapter.version`: Adapterが選択されている場合。
- `adapter.capabilities`: Adapterが選択されている場合。
- `pages[].sourcePath`: Standard Web Sourceと接続する場合。
- `components[]`: Page内にTBalanceと接続するComponentがある場合。
- `components[].tbId`: Component Mappingを持つ場合。
- `components[].domRef`: `tbId` からDOM解決できない場合、既存HTMLへ `data-tb-id` を入れていない場合、特殊Mappingが必要な場合。
- `components[].editableProperties`: Compatible / Known Existingで編集可能範囲を明示する場合。
- `components[].protectedProperties`: 変更禁止範囲がある場合。
- `components[].behaviorRef`: 既存Behaviorに接続する場合。

Optional:

- `components[].role`
- `components[].assetRef`
- `components[].notes`

Compatibility Statusはmanifestの恒久Authority情報にはしません。現在状態からCompatibility Diagnosisが計算します。

### sourcePathの扱い

`sourcePath` はStandard Web上のSource位置を示します。

基本:

```json
"sourcePath": "observatory.html"
```

`query`、route state、display mode、time modeなどのView Stateは、`sourcePath` へ混ぜません。必要な場合はProject Adapterまたは別の接続情報で解決します。

理由:

- file path、query、view stateを複合値にすると意味が曖昧になる
- SPA、Query-based View、Local Test、他Builderとの接続で扱いづらくなる
- Standard Web Source位置と表示状態を分離した方がCompatibility判定が安定する

TeaMerryの `?time=night` のような表示状態は、Core本文の前提ではなくProject Adapter側で解決します。

## 7. Version管理

Versionは分けて管理します。

- TBalance App Version
- Compatibility Spec Version
- Adapter Version
- Safe Change Instruction Version

manifestでは `compatibilitySpecVersion` を使います。TBalance App Versionとは一致させる必要はありません。

## 8. HTML Metadata

HTMLに入れるmetadataは最小限にします。

候補:

```html
data-tb-id
data-tb-role
data-tb-component
```

`data-tb-id` 命名規則:

- lowercase kebab-case
- 意味のある安定ID
- Page内で一意
- 座標、表示順、自動連番だけに依存しない

`tbId` と `data-tb-id` が一致し、通常解決できる場合、manifest側の `domRef` は省略可能です。

## 9. data-tb-id付与責任

Native:
TBalanceが生成・管理します。

Compatible:
互換仕様に従い、制作AI / Builder / TBalanceのいずれかが安定IDを持たせます。

Known Existing / Unknown Existing:
Analyzerが候補を提示します。ただし、既存HTMLへ勝手にmetadataを書き込みません。人間またはAgentによる確認後に正式Mappingとして確定します。

## 10. Adapter Interface

依存方向:

```text
TBalance Core
  -> Generic Adapter Interface
    -> Project Adapter
```

Adapterは自動適用しません。Projectごとに `None / Generic / Project Adapter` から明示選択します。自動判定は候補提示までです。

最小Interface:

- `getKnownPages()`
- `resolveInternalLink(target, context)`
- `resolveTestUrl(target, context)`
- `getComponentMapping(pageId, tbId)`
- `getProtectedBehavior(pageId, tbId)`

AdapterはProject固有のPage、Link、Behavior、Component Mapping、Protected BehaviorをCoreへ説明します。Adapter自身が勝手にHTML / CSS / JSを書き換える構造にはしません。

## 11. Adapter Capability

Adapter Capabilityはboolean objectを基本にします。

```json
{
  "pages": true,
  "links": true,
  "componentMapping": true,
  "protectedBehavior": true,
  "patch": false
}
```

初期段階では `patch` は原則 `false` です。Safe Patch Generatorは別Phaseです。

## 12. Compatibility Diagnosis

Compatibility Statusはmanifestへ恒久保存するAuthority情報ではありません。現在のWeb、manifest、Mappingを照合してRuntimeで診断する値です。

Compatibility Diagnosis Status:

- `ready`
- `missing-metadata`
- `analysis-required`
- `protected-behavior`
- `unknown`
- `not-ready`

CoreはStatus名のみ定義します。色や表示ラベルはUI Specificationへ分離します。

## 13. Read Only Analyzer

Analyzerは最初、ページを変更せず構造を読むだけです。

Analyzer ResultはRuntime / Temporary Dataです。必要な場合のみ、Debug、Handoff、Exportとして保存できます。通常Projectへ `analysis-result.json` を毎回生成しません。

## 14. Analyzer Result Schema

Analyzer ResultはObserved / Inferredを分けます。

```json
{
  "pageIdCandidate": "landing",
  "urlOrPath": "landing.html",
  "analyzedAt": "2026-08-24T00:00:00Z",
  "elements": [
    {
      "candidateId": "primary-action",
      "observed": {
        "domRef": "#cta",
        "parentRef": ".hero",
        "bounds": {
          "x": 100,
          "y": 200,
          "width": 180,
          "height": 48
        },
        "href": null,
        "eventDetected": true
      },
      "inferred": {
        "role": "button",
        "layoutType": "absolute",
        "jsInfluence": "unknown",
        "analysisStatus": "behavior-analysis-required",
        "confidence": 0.72,
        "evidence": ["button-element", "click-event"]
      }
    }
  ]
}
```

Observed:

- DOM
- id
- class
- href
- bounds
- computed value
- eventの存在

Inferred:

- role
- Behaviorの意味
- 編集安全性
- Layout Dependency
- JSの目的

Inferredを確定情報として扱いません。

Analyzer Status:

- `safe-visual-edit`
- `layout-dependency`
- `behavior-analysis-required`
- `protected`
- `unknown`

## 15. Analyzer ResultからmanifestへのFlow

正式Flow:

```text
Existing Web
  -> Read Only Analyzer
  -> Observed / Inferred Result
  -> User / Agent Review
  -> Confirmed Mapping
  -> manifest
```

Analyzer Resultからmanifestへ自動確定しません。

## 16. Safe Change Instruction

Safe Change InstructionはDiffとは別概念です。

Diff:
Before / Afterの差分。

Safe Change Instruction:
Before / Afterに加えて、Allowed、Protected、Intent、Validationを持つ安全な変更依頼。

Flow:

```text
Visual Edit
  -> Before / After Diff
  -> Adapter / manifestからSafety Rule取得
  -> User Intent付加
  -> Validation付加
  -> Safe Change Instruction
  -> Agent
```

Safe Change InstructionもRuntime Dataです。WITH AI、Agent Handoff、Debug、Exportなどで必要な場合だけJSONとして保存できます。

### No-op Change禁止

`changes[]` には、BeforeとAfterが同一のPropertyを入れません。

例:

```json
{
  "property": "position.x",
  "before": "74.64%",
  "after": "74.64%"
}
```

上記は変更ではないため、`changes[]` から除外します。

基本ルール:

- `before != after` のPropertyのみDiff / Safe Change Instructionへ含める
- 変更が0件の場合、Safe Change Instructionを生成しない
- 変更が0件で記録が必要な場合は `no-change` として扱う

これにより、AI / Agentが「変更指示がある」と誤認することを防ぎます。

## 17. Safe Change Instruction Schema

```json
{
  "instructionVersion": "1.0",
  "projectId": "example-project",
  "pageId": "landing",
  "target": {
    "tbId": "hero-character"
  },
  "sourceAuthority": "standard-web",
  "userIntent": "キャラクターを少し右へ移動する",
  "changes": [
    {
      "property": "position.x",
      "before": "42%",
      "after": "48%"
    }
  ],
  "allowedProperties": ["position"],
  "protectedProperties": ["behavior", "dataSource"],
  "behaviorRef": "hero-character-click",
  "doNotChange": ["existing click event"],
  "validationChecks": [
    "PC layout remains correct",
    "Mobile layout remains correct",
    "Existing click behavior unchanged",
    "No console errors"
  ],
  "summary": "hero-characterを右へ6%移動。既存クリック処理は変更禁止。"
}
```

JSONはMachine / Agent向けです。`summary` は人間確認、WITH AI、引き継ぎ向けです。可能なら構造化Dataから生成します。

## 18. Generic Tabletop Test

### Case A: TBalance Native

Entry Type:
`native`

Source Authority:
`tbalance`

manifest:
Project ID、Page ID、Source Authorityのみで開始可能。Standard Web接続がない段階ではComponent Mappingは不要。

Analyzer要否:
不要。

Editable:
TBalance内Layer、Canvas、Hit Area、Link。

Protected:
基本なし。ユーザーが保護設定したLayerやBehaviorがあれば別。

Safe Change:
既存Web反映ではないため通常不要。Export / Publish時はTBalanceから生成。

判定:
Core Specificationだけで説明可能。

### Case B: External AI Generated / TBalance Compatible

Entry Type:
`compatible`

Source Authority:
接続時に `tbalance` または `standard-web` を選択。

manifest:
`compatibilitySpecVersion`、`projectId`、`pages[]`、`sourceAuthority`、必要なComponent Mappingを持つ。

Analyzer要否:
metadataが揃っていれば不要。不足時のみAnalyzerで補助。

Editable:
manifestの `editableProperties` に従う。

Protected:
manifestの `protectedProperties` と `behaviorRef` に従う。

Safe Change:
Source Authorityが `standard-web` の場合はSafe Change Instruction経由。`tbalance` の場合はTBalance Sourceへ保存。

判定:
Core Specificationだけで説明可能。

### Case C: Unknown Existing Standard Web

Entry Type:
`unknown-existing`

Source Authority:
`standard-web`

manifest:
初期状態では存在しない、またはProject / Pageの最小情報のみ。

Analyzer要否:
必須。Read Only Analyzerから開始。

Editable:
初期状態ではなし。

Protected:
不明BehaviorはProtectedまたはUnknown扱い。

Safe Change:
Analyzer Result -> Review -> Confirmed Mapping -> manifest 後、必要に応じてSafe Change Instructionを作る。

判定:
Core Specificationだけで説明可能。

## 19. Reference Project: TeaMerry

TeaMerryはCore仕様の前提ではなく、Core仕様を検証するReference Projectです。

TeaMerryで必要なProject固有情報はAdapterへ分離します。

将来Adapterへ分離する既存負債:

- `TEA_MERRY_PAGE_LINKS`
- `getTeaMerryPageLink()`
- `getTeaMerryLocalTestUrl()`
- TeaMerry専用displayMode判定
- TeaMerry専用リンク解決

TeaMerryで問題が出た場合、まずProject Adapterで解決できないか検討します。CoreをTeaMerryに合わせて変更しません。

## 20. Core 1.0の正式化根拠

Core 1.0は、以下の検証を通過したものとして確定します。

Generic Test:

- Case A: TBalance Native
- Case B: External AI Generated / TBalance Compatible
- Case C: Unknown Existing Standard Web

Reference Test:

- TeaMerry Forest / Known Existing

Reference Testでは、Core Gapなし、TeaMerry固有情報のAdapter分離、Known Existingのstandard-web Authority、Visual / Behavior / Adapter分離、Protected Behavior、Analyzer Result / manifest分離、Safe Change Instructionの有効性を確認しました。

## 21. 1.0でやらないこと

Core / Compatibility Specification 1.0は、実装仕様をすべて完成させる文書ではありません。

以下は次Phaseです。

- Analyzer実装
- Adapter実装
- manifest生成機能
- Safe Change生成機能
- WITH AI再設計
- SITE MAP
- FINAL
- Publish
- Safe Patch
- TeaMerry metadata追加

Core 1.0は、これらが従う共通ルールを定義します。
