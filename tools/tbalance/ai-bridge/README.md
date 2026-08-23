# TBalance AI Bridge

TBalanceの `WITH AI` 共有更新用のローカルブリッジです。

## 起動

```powershell
node tools/tbalance/ai-bridge/server.mjs
```

このサーバーは `127.0.0.1:8787` のみにbindします。外部ネットワークには公開しません。

## 共有データ

- `current-state.json`: 最新のTBalance状態
- `current-view.webp`: 最新のTBalance画面
- `ai-suggestion.json`: Codex側からTBalanceへ返す青ペン提案
- `history/`: ページごとのWITH AI共有履歴

これらは作業中の一時共有データなのでGit管理対象外です。

## 共有履歴

- 共有更新ごとに、現在状態と画面画像を履歴へ保存します。
- 履歴はページごとに直近5件まで保持します。
- 6件目以降は古い履歴から自動削除します。
- 履歴を復元した場合、復元元を新しい最新版として追加します。
- 相談内容・AI返答ログは、共有履歴とは別枠で扱う方針です。

## API

- `GET /api/tbalance/health`
- `POST /api/tbalance/share`
- `GET /api/tbalance/state`
- `GET /api/tbalance/screenshot`
- `GET /api/tbalance/history`
- `POST /api/tbalance/history/restore`
- `GET /api/tbalance/suggestion`
- `POST /api/tbalance/suggestion`

## AI提案データ

Codex側から `POST /api/tbalance/suggestion` に青ペン提案を書き込むと、TBalanceのWITH AIパネルから「AI提案を読み込み」で画面へ反映できます。

例:

```json
{
  "suggestions": [
    {
      "type": "arrow",
      "viewport": "desktop",
      "from": { "x": 1120, "y": 520 },
      "to": { "x": 980, "y": 680 },
      "text": "リルは少し左下の方が視線誘導しやすいです"
    }
  ]
}
```
