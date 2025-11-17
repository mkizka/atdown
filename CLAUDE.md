# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

atdownは、MarkdownファイルとATProtoのレコードを双方向同期するCLIツールです。WhiteWindなどのATProtoベースのブログサービスのレコードを、ローカルでMarkdownとして管理できます。

## モノレポ構成

このプロジェクトはpnpm workspacesを使用したモノレポで、以下の3つのパッケージで構成されています：

- `packages/core`: コアロジックを含むライブラリ（`@mkizka/atdown-core`）
- `packages/cli`: CLIインターフェース（`@mkizka/atdown`）
- `packages/whtwnd`: WhiteWind用のコンバーター実装（`@mkizka/atdown-whtwnd`）

## 開発コマンド

### ビルド・検証・テスト

```bash
# すべてのパッケージをビルド
pnpm build

# リント実行
pnpm lint

# フォーマット（自動修正込み）
pnpm format

# 型チェック
pnpm typecheck

# テスト実行
pnpm test

# すべて実行（ビルド→型チェック→フォーマット→テスト）
pnpm all
```

### 個別パッケージの操作

```bash
# coreパッケージのみビルド
pnpm --filter @mkizka/atdown-core build

# coreパッケージのみテスト
pnpm --filter @mkizka/atdown-core test

# coreパッケージに依存関係追加
pnpm --filter @mkizka/atdown-core add <package-name>
```

### CLI実行

```bash
# 開発環境でCLIを実行（.envファイルから環境変数を読み込む）
pnpm atdown
```

## アーキテクチャ

### コアコンセプト

atdownは**Converter**という抽象化を中心に設計されています。Converterは特定のATProtoコレクション（例: `com.whtwnd.blog.entry`）に対して、以下の変換を提供します：

- `recordToMarkdown`: ATProtoレコード → Markdown形式
- `markdownToRecord`: Markdown形式 → ATProtoレコード

### レイヤー構造

**coreパッケージ**は以下のレイヤーで構成されています：

1. **Commands** (`commands/`): ビジネスロジックの実装
   - `push.ts`: ローカル→リモートへのアップロード
   - `pull.ts`: リモート→ローカルへのダウンロード
   - `new.ts`: 新規Markdownファイルの作成

2. **Infrastructure** (`infra/`): 外部システムとのやり取り
   - `RecordRepository`: ATProto PDSとの通信（@atproto/api使用）
   - `MarkdownRepository`: ローカルファイルシステムの操作
   - `ConverterLoader`: 動的なコンバーターの読み込み
   - `HandleResolver`: ATProtoハンドルからPDS URLへの解決
   - `MarkdownParser`: Markdownのfront matterパース（gray-matter使用）

3. **Service** (`service/`): ドメインロジック
   - `diff.ts`: ローカルとリモートの差分検出

4. **Types**: 型定義
   - `Markdown`: front matterとcontentを持つMarkdown表現
   - `RecordJson`: ATProtoレコードのJSON表現

### push/pullの処理フロー

**Push処理** (`commands/push.ts`):

1. ハンドルからPDS URLを解決してログイン
2. 設定ファイルから全コンバーターを読み込み
3. 各コンバーターについて：
   - ローカルのMarkdownエントリーを取得
   - リモートのレコードを取得してMarkdownに変換
   - 差分があるものを抽出
   - Markdownをレコードに変換
4. 差分があるレコードをPDSに保存

**Pull処理** (`commands/pull.ts`):

1. ハンドルからPDS URLを解決してログイン
2. 設定ファイルから全コンバーターを読み込み
3. 各コンバーターについて：
   - ローカルのMarkdownエントリーを取得
   - リモートのレコードを取得してMarkdownに変換
   - 差分があるものを抽出
4. 差分があるMarkdownをローカルに保存

### 設定ファイル

`atdown.json`またはenv変数で設定を指定：

```json
{
  "handle": "user.bsky.social",
  "entriesDir": "./entries",
  "converters": ["@mkizka/atdown-whtwnd"]
}
```

環境変数: `ATDOWN_HANDLE`, `ATDOWN_ENTRIES_DIR`, `ATDOWN_CONVERTERS`（カンマ区切り）

### 新しいコンバーターの作り方

`@mkizka/atdown-whtwnd`を参考に、以下の形式で実装：

```typescript
import { createConverter } from "@mkizka/atdown-core";

export default createConverter({
  collection: "com.example.mycollection",
  recordToMarkdown: (record) => {
    // レコードからMarkdownへの変換
    return { content: "...", metadata: { ... } };
  },
  markdownToRecord: (markdown) => {
    // MarkdownからレコードJSONへの変換
    return { $type: "com.example.mycollection", ... };
  },
});
```

## 依存関係の注意点

- `@atproto/*`: ATProto関連の公式ライブラリ
- `valibot`: 実行時バリデーション（Zodの軽量代替）
- `gray-matter`: Markdownのfront matter解析
- `commander`: CLIフレームワーク
- `vitest`: テストフレームワーク

## 仕様書

仕様については docs/spec.md を確認してください。
