# TeaMerry 投稿・感想 自動保存 V1

## 現在の状態

Google Sheets作成済み:
https://docs.google.com/spreadsheets/d/1C7L5aUSEswt0_51CROS8wCk0DXySplJNa0G5QDWzSGE/edit

受信コード保存済み（このSheetに紐づくプロジェクト）:
https://script.google.com/home/projects/1CTtkXgfYQ_XnGJ80qEWUvfVOrXJNSytPqWbLHKH6Wu27DLI_kHJ0garE/edit

2026-10-08: 本人によるGoogle権限承認、setup実行完了、Web App公開、3種類の実送信確認が完了。
実行者は自分、アクセスは全員（Googleログイン不要）。Sheet自体は非公開のまま。
root/docsのendpointを以下の本番受信URLへ設定済み。
https://script.google.com/macros/s/AKfycbwFHlIVbP6w58hJq2P3sYcX4oYmnIXcuD5-LFgApb9IHiMu0vs2JKXb8Q7srX2MbZvZ/exec
感想導線をc2d0d2eでcommit / mainへ通常push / サイト公開済み。Core等の既存差分は除外。

## 1. スプレッドシート

上記Google Sheetsを開く。4シートは作成済み:
ミュージカル感想 / ボトルメール / 願い星 / まとめ。
各受信シートの表示列は日時・名前・本文・確認状態。
まとめに総数・未確認・今日・今月を自動集計。日本時間設定済み。
TEST行は感想3件・ボトル1件・願い星1件。削除・確認済みへの変更はしていない。

## 2. Apps Script初期設定

上記受信プロジェクトを開く。Code.gsは保存済み。
必要なら本フォルダのCode.gsをエディタのコード.gsへ貼り付けて保存する。
関数一覧でsetupSubmissionSheetsを選び、実行する。
Googleの権限画面は本人が確認する。新規の自身のスクリプトは未確認アプリ警告が出る場合がある。
このコードのSpreadsheet権限はGoogle側のスプレッドシートアクセスを許可するもの。
コードが操作する保存先はSPREADSHEET_IDに固定され、受信リクエストで変更できない。
setup完了時にE:FへrequestId/fingerprintを作成して非表示にし、Dへ確認状態の入力規則を設定する。
既存投稿行は消さない・上書きしない。setupは一度実行後も再実行可能。
プロジェクト設定で必要ならappsscript.jsonを表示し、本フォルダのmanifestを反映する。

## 3. Web App公開

デプロイ → 新しいデプロイ → ウェブアプリ。
実行するユーザー: 自分。
アクセスできるユーザー: 全員（Googleログイン不要の投稿受付）。
スプレッドシート自体を公開・共有する必要はない。
Web Appは受信専用で、保存済み本文を外部へ返すAPIはない。
デプロイ完了後のURL末尾が/execであることを確認する。/devは使用しない。

## 4. サイトURL設定

js/submission-config.jsのendpointへ/exec URLを設定。
docs/js/submission-config.jsにも同じURLを設定。
TBalance Coreには追加しない。コード更新時はApps Script側を新バージョンとして再デプロイする。

## 5. TEST送信・保存確認

ローカルpreview-server.cjsは読み取り専用。Googleの権限とWeb App設定後に実送信を行う。
ミュージカル: musical/boku-no-takaramono/pair-preview.html。
ボトルメール: observatory.html?time=day。
願い星: observatory.html?time=night。
本文にTESTと明記し、3種類を別々に送る。名前あり/なし、300文字、301文字、空本文、連続送信も確認。
成功応答を受けた後だけ既存localStorageと投稿演出が動く。
各Sheetの日時（日本時間）、名前、本文、未確認を確認し、まとめ件数と突き合わせる。
TEST行は勝手に削除しない。確認済みへ変更するか別工程で扱う。
実ブラウザでCORSを含む応答確認が必要。no-cors/opaque応答を成功と扱わない。

## 実装

- Code.gs: doPost検証 → ScriptLock → requestId照合 → 連投制限 → 新規行に1回の書き込み → flush → 成功応答。
- client: text/plain POSTでJSON送信、確認できた成功応答のみ成功判定。タイムアウト時は入力保持。
- 同じ入力の再試行は同じrequestIdを使用（同じページ内）。保存済みなら重複追加しない。
- レート制限はclientIdあたり30秒。clientId変更・キャッシュ追い出しによる回避は可能。強い認証やIP制限ではない。
- 本文は空/空白のみ不可・最大300 UTF-16コード単位。HTMLタグ・制御文字・未知種別を拒否。
- 名前は任意・最大80 UTF-16コード単位。メール/電話は収集しない。
- '='から始まる名前・本文はSheetのリテラル文字列として書く。式を実行させない。
- musical_feedbackのworkIdはboku-no-takaramono。別作品追加時は受信側の許可作品を明示的に拡張する。
- public選択は既存localStorageにそのまま保持。Sheet V1では公開/非公開管理を追加しない。
- ボトル/願い星は既存表示名を使用。名前を必須にはしない。
- 既存Dialogue、Reaction選択、動画・3行Sequence本体は変更していない。
- root/docsの既存BGM・動画・Native Eventの差異は保持。全ファイルを同一版で上書きしていない。

## ローカル検証

node tools/tests/submissions.cjs

受信側はモックSheetで3種類・境界・不正入力・式文字列・重複・排他・連投を検証。
ブラウザはroot/docs × PC/スマホで実ページを開き、成功応答モック・保存失敗・入力保持・再試行ID・既存localStorageを検証。
Googleへの実保存が確認済みという意味ではない。

## 2026-10-08 実送信検証

ローカルサイトの実フォームからGoogleへ送信し、成功応答と既存演出を確認。
- ミュージカル感想: 05:04:28 JST、TEST 実送信確認、未確認。
- ボトルメール: 05:05:14 JST、おさんぽさん、未確認。
- 願い星: 05:05:49 JST、おさんぽさん、未確認。
- まとめ: 各1件、総数3、未確認3、今日3、今月3。
- node tools/tests/submissions-live.cjs: 認証情報なしで3種の同一ID再送がduplicate:true、本文変更id_conflict、空/空白/301文字invalid_message、HTML invalid_text。
- 再送と不正入力の後も各1件・総数3を読み戻して確認。
- node tools/tests/submissions.cjs: root/docsのPC/スマホ回帰テストとGASモック検証も再実行成功。

上記は投稿基盤完成時点の検証結果。続く感想HitArea接続・公開工程で公開前と公開後に感想を各1件追加。
公開後確認: 2026-10-08 05:40:02 JST、感想3件・総数5、未確認/今日/今月5。TEST行を保持。
Web AppとWebサイトは公開済み。詳細はdocument/Musical_Feedback_Connection_2026-10-08.md。

公式資料:
https://developers.google.com/apps-script/guides/web
https://developers.google.com/apps-script/guides/content
https://developers.google.com/apps-script/reference/lock/
