# @mkizka/atdown-whtwnd

WhiteWind用のatdownコンバーター。`com.whtwnd.blog.entry`レコードとMarkdownを相互変換します。

## インストール

```bash
npm install @mkizka/atdown-whtwnd
```

## 設定

`atdown.json`の`converters`に追加:

```json
{
  "converters": ["@mkizka/atdown-whtwnd"]
}
```

## 変換例

ATProtoレコード:

```json
{
  "$type": "com.whtwnd.blog.entry",
  "content": "## 本文\nこれがコンテンツ",
  "createdAt": "2024-01-01T00:00:00Z",
  "visibility": "url"
}
```

Markdown:

```markdown
---
createdAt: 2024-01-01T00:00:00Z
visibility: url
---

## 本文

これがコンテンツ
```

## ライセンス

MIT
