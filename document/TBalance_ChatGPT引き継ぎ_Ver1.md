# TBalance Ver.1 ChatGPT引き継ぎ

更新日: 2026-08-24

## 目的

TBalanceは、TeaMerry Forest専用の配置・当たり判定・PC/Mobile確認・AI共有用エディターとして作っている。

最初の大きな目的は、星風テラスなどのページで「PCとMobileの当たり判定が見えず、位置修正が難しい」問題を解決することだった。

現在、Ver.1として以下の流れまで到達した。

TBalanceで配置を見える化する  
PC / Mobile別に位置を調整する  
当たり判定を緑枠で確認する  
WITH AIでCodexへ現在状態を共有する  
Codexが共有情報を見て公開用HTML/CSS/JSへ反映する  
GitHub Pagesへpushして実ページで確認する

## Ver.1でできたこと

- PC / Mobileのキャンバス切り替え
- PC / Mobile並べて表示
- PC / Mobile別の背景画像管理
- PC / Mobile別のレイヤー位置管理
- レイヤー一覧表示
- レイヤーの表示 / 非表示 / ロック
- レイヤー名変更
- 複数選択
- 画像配置
- テキスト配置
- 図形配置
- ボタン素材配置
- グループ化 / グループ解除
- 当たり判定レイヤー
- 当たり判定の緑枠表示
- 当たり判定のリンク先設定
- ペン、消しゴム、塗りつぶし、レタッチ、クローンブラシ試作
- 自分メモ
- Markup / 赤ペン指示
- WITH AI共有
- WITH AI共有履歴5件
- CodexからのAI青ペン提案読み込み
- 新規キャンバス作成
- 保存 / 開く / 閉じる / スクリーンショット

## 星風テラス夜で確認できたこと

TBalance上で以下を調整した。

- PC背景
- Mobile背景
- リルの位置
- 吹き出し位置
- 戻るボタン
- 「願い星を書く」の当たり判定
- 「今日のほっこり」の当たり判定
- PC / Mobileそれぞれの当たり判定位置

その後、CodexがTBalanceの共有情報を見て、公開用の以下へ反映した。

- `observatory.html`
- `observatory.js`
- `css/observatory.css`
- `docs/observatory.html`
- `docs/observatory.js`
- `docs/css/observatory.css`

GitHub Pagesへpushし、実ページで確認した。

## 重要な学び

TBalance内で配置を直しても、それだけでは公開ページは変わらない。

現時点では、TBalanceは「公開HTMLを自動生成する完成エクスポーター」ではなく、「配置と当たり判定を視覚的に決めてCodexへ正確に共有する編集支援ツール」。

公開反映は、Codexが共有状態を読み、既存HTML/CSS/JSを壊さないように必要箇所だけ反映する。

特に「今日のほっこり」のような既存システムは注意が必要。

一度、今日のほっこりを通常カード表示へつないでしまい、既存の星型ランダム表示が崩れた。
その後、夜の今日のほっこりは元の星型ランダム表示へ戻した。

この経験から、TBalanceの見た目配置だけで既存機能を丸ごと上書きしてはいけないと確認できた。

## Ver.1として区切った範囲

Ver.1は以下まで。

- 配置確認
- PC / Mobile差分確認
- 当たり判定確認
- リンク先の整理
- Markup / 赤ペン
- WITH AI共有
- Codexによる公開コードへの反映支援

Ver.1では以下は未完成扱い。

- Final Previewの本格処理
- Publishの自動公開
- TBalance形式からHTML/CSS/JSへの完全自動生成
- 画像 / 動画の本格最適化
- 既存HTML/CSS/JSの自動解析
- 既存ページをTBalanceへ完全インポートして再編集する機能

## Git上の区切り

Ver.1区切りコミット:

`f5cd185 Mark TBalance v1 layout share milestone`

Ver.1タグ:

`v1-tbalance-layout-share`

このタグを、TBalance Ver.1の到達点として扱う。

## 現在の考え方

TBalanceは今後、以下の2段階に分けて考える。

### Ver.1系

TeaMerry Forest専用の配置・当たり判定・AI共有エディター。

人間が見た目で配置し、Codexと共有して、Codexが公開コードへ反映する。

### Ver.2以降

既存HTML/CSS/JSを読み込み、DOMやCSSを分節化し、見た目で修正した差分をAIが安全に元コードへ戻す。

将来的には、AIが作った完成ホームページをTBalanceに入れて、見た目で修正し、HTML/CSS/JSへ反映できるようにしたい。

## 次に相談したいこと

次の大きなテーマは、TBalanceの保存・プレビュー・公開フローを再設計すること。

特に決めたいこと:

1. TBalance形式の保存仕様
2. Final Previewで何を確認するか
3. Publishは何をするボタンにするか
4. HTML/CSS/JS自動生成をどこまでやるか
5. 既存HTML/CSS/JSを読み込む機能をVer.2でどう設計するか
6. WITH AI共有を今後どう拡張するか
7. 「TBalanceで作った配置」と「既存ページのJS機能」をどう安全に接続するか

## ChatGPTに相談したい問い

TBalance Ver.1では、配置・当たり判定・WITH AI共有まで到達しました。

次に、Final Preview / Publish / Export / Importを設計したいです。

ただし、既存のTeaMerry Forestには、今日のほっこり、願い星、ボトルメール、会話、演出など、既に動いているJavaScript機能があります。

TBalanceから公開HTML/CSS/JSへ反映する時に、既存機能を壊さず、位置・当たり判定・リンク・吹き出しなどだけを安全に更新するには、どんな設計にするのがよいでしょうか。

また、Ver.2以降で既存HTML/CSS/JSを読み込み、見た目で修正してAIに戻す場合、どの順番で機能を作るのが安全でしょうか。
