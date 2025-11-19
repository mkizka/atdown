# atdown

MarkdownファイルとATProtoレコードを双方向同期するCLIツール。WhiteWindなどのATProtoベースのブログサービスのレコードを、ローカルでMarkdownとして管理できます。

## インストール

```bash
npm install -g @mkizka/atdown
```

## セットアップ

```bash
npx @mkizka/create-atdown
```

または手動で`atdown.json`を作成:

```json
{
  "handle": "your.handle",
  "entriesDir": "./entries",
  "converters": ["@mkizka/atdown-whtwnd"]
}
```

環境変数`ATDOWN_PASSWORD`にアプリパスワードを設定してください。

## 使い方

```bash
# リモートからローカルへ同期
atdown pull

# ローカルからリモートへ同期
atdown push

# 新規エントリー作成
atdown new
```

## 注意事項

> [!WARNING]
> コンフリクトの検出・解決機能はありません。同期時は以下のように動作します:
>
> - `pull`: リモートの内容でローカルを上書き（ローカルの変更は失われます）
> - `push`: ローカルの内容でリモートを上書き（リモートの変更は失われます）
>
> 重要な変更がある場合は、事前にバックアップを取ることを推奨します。

## パッケージ構成

| パッケージ | 説明 |
|-----------|------|
| [@mkizka/atdown](./packages/cli) | CLIツール本体 |
| [@mkizka/atdown-core](./packages/core) | コアライブラリ |
| [@mkizka/atdown-whtwnd](./packages/whtwnd) | WhiteWind用コンバーター |
| [@mkizka/create-atdown](./packages/create-atdown) | プロジェクトスキャフォールド |

## ライセンス

MIT
