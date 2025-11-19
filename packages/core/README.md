# @mkizka/atdown-core

atdownのコアライブラリ。ATProtoレコードとMarkdownの同期ロジックを提供します。

## インストール

```bash
npm install @mkizka/atdown-core
```

## 主な機能

- push/pullコマンドの実装
- ローカルとリモートの差分検出
- コンバーターの動的読み込み
- ATProto PDSとの通信

## コンバーターの作成

```typescript
import { createConverter } from "@mkizka/atdown-core";

export default createConverter({
  collection: "com.example.mycollection",
  recordToMarkdown: (record) => {
    return {
      content: record.content,
      metadata: { title: record.title },
    };
  },
  markdownToRecord: (markdown) => {
    return {
      $type: "com.example.mycollection",
      content: markdown.content,
      title: markdown.metadata.title,
    };
  },
});
```

## ライセンス

MIT
