# TBalance Compatibility Checklist 1.0

Ver.2026-08-24 / Formal 1.0

この文書は、TBalance Core / Compatibility Specification 1.0に対応するCompatibility Checklist 1.0の正式版です。manifestに恒久保存されたStatusを読むのではなく、現在のWeb、manifest、Mapping、Adapterを照合してRuntimeで診断することを基本にします。

この1.0はTBalance Editor Ver.1とは別概念です。Core / Compatibility Specification 1.0の診断観点を定義します。

## 1. Compatibility Diagnosisの位置づけ

Compatibility Diagnosisは、現在このPageをTBalanceでどこまで扱えるかを判定するRuntime診断です。

Compatibility Diagnosisは以下を入力にします。

- Standard Web Source
- `.tbalance`
- `tbalance.manifest.json`
- Adapter
- Analyzer Result
- Confirmed Mapping

Compatibility Diagnosisは以下ではありません。

- manifestのAuthority情報
- Analyzer Resultそのもの
- UI色定義
- 永続履歴

## 2. Compatibility Diagnosis Status

Coreが定義するStatus名:

- `ready`
- `missing-metadata`
- `analysis-required`
- `protected-behavior`
- `unknown`
- `not-ready`

意味:

`ready`:
必要なIdentity、Authority、Mapping、Layout、Interaction、Protectionが揃い、安全にVisual編集できます。

`missing-metadata`:
構造は推定できますが、安定ID、manifest、Mappingなどが不足しています。

`analysis-required`:
Read Only Analyzerや人間 / Agent確認が必要です。

`protected-behavior`:
Visual編集可能でも、既存Behaviorを変更してはいけません。

`unknown`:
構造やAuthorityが不明です。Read Onlyで扱います。

`not-ready`:
公開、自動反映、Safe Change Instruction化に進めません。

色、アイコン、表示名はUI Specification側へ分離します。

## 3. Analyzer Status

Analyzer StatusはCompatibility Diagnosis Statusとは別です。

Analyzer Status:

- `safe-visual-edit`
- `layout-dependency`
- `behavior-analysis-required`
- `protected`
- `unknown`

Analyzer Statusは、Analyzerが要素をどう解析したかを示します。Compatibility Diagnosisは、Analyzer Statusに加えてmanifest、Adapter、Confirmed Mappingを見て総合判定します。

## 4. UI診断カテゴリ

Compatibility Checklistは、TBalance UI上で以下のカテゴリとして表示できる構造にします。

- Identity
- Source Authority
- Mapping
- Layout
- Interaction
- Protection
- Compatibility Status

## 5. Identity

Project、Page、Componentを安定して識別できるかを確認します。

### Project Identity

確認項目:

- Project IDがある
- Site Name / Project Nameが分かる
- Entry Typeが分かる
- Project単位manifestを参照できる

判定:

- `ready`: Project単位の識別が明確
- `missing-metadata`: Project IDまたはmanifest参照がない
- `unknown`: どのProjectとして扱うか不明

### Page Identity

確認項目:

- Page IDがある
- Page Nameがある
- Page Roleが分かる
- PC / Mobileの対象Pageが分かる

判定:

- `ready`: Pageを安定識別できる
- `missing-metadata`: HTMLはあるがPage IDがない
- `analysis-required`: ページ遷移やView切替がJSで動的

### Component / Layer Identity

確認項目:

- 主要要素に安定IDがある
- IDがPC / Mobileで対応している
- IDが再生成で変わらない
- `data-tb-id` がlowercase kebab-caseで意味のある名前になっている

判定:

- `ready`: 安定IDあり
- `missing-metadata`: DOM id/classはあるがTBalance IDなし
- `analysis-required`: 画像に焼き込まれていて分離不可

## 6. Source Authority

どのSourceを正本として扱うかを確認します。

確認項目:

- Entry Typeが分かる
- Source Authorityが `tbalance` または `standard-web` で明示されている
- Page単位のSource Authorityが決まっている
- 衝突時の優先ルールがある
- Protected Behaviorの例外保護が記録されている

判定:

- `ready`: Authority明確
- `missing-metadata`: Authority記録なし
- `protected-behavior`: 既存動作が正本
- `unknown`: 自動上書き禁止

Entry Type別の基本判定:

- Native: Source Authorityは `tbalance`
- Compatible: `tbalance` または `standard-web`
- Known Existing: Source Authorityは `standard-web`
- Unknown Existing: Source Authorityは `standard-web`

## 7. Mapping

TBalance上の要素とStandard Web側の要素が安全につながるかを確認します。

### Manifest Mapping

確認項目:

- `compatibilitySpecVersion` がある
- `projectId` がある
- `pages[]` がある
- `pages[].pageId` がある
- `pages[].sourceAuthority` がある
- `pages[].sourcePath` がStandard Web上のSource位置として扱われている
- query / route state / display mode / time modeを `sourcePath` に混ぜていない
- manifestが第二の `.tbalance` になっていない

判定:

- `ready`: 軽量manifestあり
- `missing-metadata`: 必須項目不足
- `analysis-required`: 既存ページから候補生成が必要

### DOM Mapping

確認項目:

- `tbId` からDOMを解決できる
- `data-tb-id` がある、または条件付き `domRef` がある
- Parent DOMが分かる
- CSS selectorが安全に特定できる

判定:

- `ready`: `tbId` から安定DOM解決可能
- `missing-metadata`: class/idのみ、または `domRef` 不足
- `analysis-required`: 複雑な親Layout依存あり

### domRef Conditional Check

確認項目:

- `data-tb-id` が存在する場合、不要な `domRef` 重複がない
- Known Existingでmetadata未付与の場合、`domRef` がある
- 特殊DOM Mappingが必要な場合、`domRef` がある

判定:

- `ready`: 重複なく解決できる
- `missing-metadata`: `tbId` からDOM解決できず、`domRef` もない

### Asset Mapping

確認項目:

- 画像 / 動画 / 音声Assetのパスが分かる
- PC / Mobileで別Assetか共通Assetか分かる
- 画像サイズと形式が分かる

判定:

- `ready`: Asset Reference明確
- `missing-metadata`: pathのみ
- `analysis-required`: CSS backgroundやJS生成Asset

## 8. Layout

Visual編集が安全かを確認します。

### Viewport Layout

確認項目:

- PC Layoutがある
- Mobile Layoutがある
- 共通Layoutか別Layoutか分かる
- Responsive CSSとの関係が分かる

判定:

- `ready`: PC / Mobileともに明確
- `missing-metadata`: 片方のみ
- `analysis-required`: media query / flex / grid依存

### Parent Layout Dependency

確認項目:

- 親要素のposition / transform / scaleに依存しているか
- overflow / clippingがあるか
- z-index contextがあるか

判定:

- `ready`: 親依存なし、またはMapping済み
- `analysis-required`: 親依存あり
- `protected-behavior`: DOM変更不可

### Editable Visual Properties

確認項目:

- position
- size
- hit area
- visual style
- text
- asset
- link

判定:

- `ready`: 編集可能項目が明示されている
- `missing-metadata`: 編集範囲未定義
- `analysis-required`: Visual変更の影響範囲が不明

## 9. Interaction

クリック、リンク、画面遷移、既存JSイベントを確認します。

### Hit Area

確認項目:

- Hit Areaの位置とサイズが分かる
- shapeが分かる
- targetが分かる
- PC / Mobile別位置が分かる

判定:

- `ready`: TBalanceで可視化・編集可能
- `missing-metadata`: buttonはあるが範囲情報なし
- `protected-behavior`: クリック先が既存JS処理

### Internal Link

確認項目:

- TBalance内Page IDへ移動するのか
- 既存HTML Pageへ移動するのか
- JS view切替なのか
- displayModeが分かる

判定:

- `ready`: link typeとtarget明確
- `analysis-required`: JSで画面切替
- `protected-behavior`: 既存Navigation Logicあり

### External Link

確認項目:

- URLが明確
- 新規表示 / 同一表示 / Modal表示が分かる
- テスト表示方式が分かる

判定:

- `ready`: URLとdisplayMode明確
- `missing-metadata`: URLのみ
- `analysis-required`: 外部Script連携

### Existing JS

確認項目:

- 対象DOMにJSイベントが紐づいているか
- JSがDOM構造を前提にしているか
- data処理があるか
- event / related JSをAnalyzerが検出したか

判定:

- `ready`: JS影響なし、またはBehaviorRefあり
- `analysis-required`: JS影響あり
- `protected-behavior`: 既存JSを維持

## 10. Protection

TBalanceが壊してはいけない領域を確認します。

### Protected Behavior

確認項目:

- TBalanceが変更してよい項目が分かる
- 変更禁止項目が分かる
- Unknown BehaviorをProtected扱いできる
- BehaviorRefがある

判定:

- `ready`: editable / protectedが明確
- `protected-behavior`: 変更禁止
- `unknown`: 安全確認前に編集不可

### Analyzer Safety

確認項目:

- Analyzer ResultがObserved / Inferredに分かれている
- Inferredを確定情報として扱っていない
- DOMを発見しただけでSafe Editにしていない
- CSSを発見しただけでSafe Editにしていない
- JS / Parent Layout / Responsive / Dynamic Stateの影響を区別している

判定:

- `ready`: 影響範囲が明確
- `analysis-required`: 解析はできたが安全性未確定
- `unknown`: 影響範囲不明

### Safe Change Readiness

確認項目:

- Before / After Diffがある
- `changes[]` にBeforeとAfterが同一のNo-op Propertyが含まれていない
- `before != after` のPropertyのみSafe Change Instructionへ含まれている
- 変更が0件の場合、Safe Change Instructionを生成しない、または `no-change` として扱う
- Adapter / manifestからSafety Ruleを取得できる
- User Intentがある
- `validationChecks` がある
- `doNotChange` がある

判定:

- `ready`: Safe Change Instruction化可能
- `analysis-required`: 変更箇所またはSafety Ruleの確認が必要
- `protected-behavior`: 既存Behaviorを直接変更不可

## 11. 一時Data管理

以下は通常Runtime / Temporary Dataです。

- Analyzer Result
- Before / After Diff
- Safe Change Instruction
- WITH AI共有
- Screenshot
- Review Memo

必要な場合のみ、Debug、Handoff、Exportとして保存します。Projectへ常時大量生成しません。

## 12. Overall判定例

### Case A: TBalance Native

- Entry Type: native
- Source Authority: tbalance
- Identity: ready
- Source Authority: ready
- Mapping: ready
- Layout: ready
- Interaction: ready
- Protection: ready
- Analyzer: 不要
- Safe Change: 通常不要
- Overall: ready

### Case B: External AI Generated / TBalance Compatible

- Entry Type: compatible
- Source Authority: tbalance または standard-web
- Identity: ready または missing-metadata
- Source Authority: ready
- Mapping: ready または missing-metadata
- Layout: ready
- Interaction: ready または protected-behavior
- Protection: ready
- Analyzer: metadata不足時のみ
- Safe Change: standard-web authority時に使用
- Overall: ready / missing-metadata / protected-behavior

### Case C: Unknown Existing Standard Web

- Entry Type: unknown-existing
- Source Authority: standard-web
- Identity: missing-metadata
- Source Authority: ready
- Mapping: unknown
- Layout: analysis-required
- Interaction: analysis-required
- Protection: unknown
- Analyzer: 必須
- Safe Change: Confirmed Mapping後のみ
- Overall: unknown / read only

## Appendix A. Reference Project: TeaMerry星風テラス

TeaMerryはCore仕様の前提ではなく、Known ExistingのReference Projectです。

TeaMerryで必要なProject固有情報はAdapterへ分離します。

想定Status:

- Entry Type: known-existing
- Source Authority: standard-web
- Adapter: teamerry
- Behavior: protected-behaviorを多く含む
- Analyzer: metadata不足部分で補助
- Safe Change: Visual Edit結果をCodex / Agentが既存コードへ必要箇所のみ反映

TeaMerryで問題が出た場合、まずProject Adapterで解決できないか検討します。CoreをTeaMerryに合わせて変更しません。

## 13. 次に必要なレビュー

Compatibility Checklist 1.0は正式版として確定します。

次Phaseで扱う項目:

- UI SpecificationへのStatus色 / 表示名定義
- Adapter実装時の具体的な診断表示
- Safe Change InstructionのAgent連携UI
- Analyzer Export / Debug UI方針
- Reference ProjectごとのProject Adapter診断
