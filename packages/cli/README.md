# @mkizka/atdown

atdownのCLIツール。MarkdownファイルとATProtoレコードを双方向同期します。

## インストール

```bash
npm install -g @mkizka/atdown
```

## コマンド

```bash
# リモートからローカルへ同期
atdown pull

# ローカルからリモートへ同期
atdown push

# 新規エントリー作成
atdown new
```

## 設定

`atdown.json`をプロジェクトルートに作成:

```json
{
  "handle": "your.handle",
  "entriesDir": "./entries",
  "converters": ["@mkizka/atdown-whtwnd"]
}
```

環境変数:
- `ATDOWN_PASSWORD`: アプリパスワード（必須）
- `ATDOWN_HANDLE`: ハンドル
- `ATDOWN_ENTRIES_DIR`: エントリーディレクトリ
- `ATDOWN_CONVERTERS`: コンバーター（カンマ区切り）

## ライセンス

MIT
