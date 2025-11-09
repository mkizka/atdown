# 仕様

Markdownで表現可能なATProtoレコードをPDSとローカルで同期・更新するCLI

## CLI仕様

```
atdown push
atdown pull
```

### atdown push

指定したディレクトリ(例：./entries)以下にあるMarkdownファイルを全て確認し、PDSにまだ無いか、内容が異なるファイルがあればputRecordする

### atdown pull

PDSのレコードのうち指定したコレクションを全て確認し、ローカルに無いか、内容が異なるエントリがあればMarkdownファイルにして保存する

## 同一性判定

ローカルとリモートのエントリーが同一かどうかを判定する際、以下の手順で比較する:

1. At-URI(collection + rkey)が一致するか確認
2. レコードをMarkdownに変換
3. front-matterのフィールドを**辞書順(アルファベット順)にソート**
4. Markdownファイルの文字列として完全一致するか比較

front-matterのフィールド順序は変換時に辞書順に正規化されるため、順序の違いは差分として扱わない。

## コンフリクトの扱い

PDS上のレコードは更新時刻のタイムスタンプが存在しないため、コンフリクトを判定出来ない。そのため以下のように扱う。

- pull ... PDSのレコードに完全一致するように更新する。ローカルの変更は消える。
- push ... ローカルファイルに完全一致するように更新する。PDSの変更は消える。

## 設定ファイル仕様

atdownコマンドを実行するディレクトリにatdown.jsonがある場合、これを設定ファイルとして読み込む。全ての設定は対応する環境変数があり、設定ファイルが優先され、設定ファイルに値がない場合のみ環境変数が使用される。

```jsonc
{
  "handle": "example.test", // atdownを使用したいアカウントのハンドル
  "entriesDir": "./entries", // エントリを管理したいディレクトリ
  "converters": ["@mkizka/atdown-whtwnd"], // エントリとレコードを相互変換するライブラリ名(複数指定可能)
}
```

## レコードとMarkdownの変換仕様(コンバーターの責務)

レコードとMarkdownの相互変換は**コンバーター**が担当する。`@mkizka/atdown-core`パッケージはレコードの内部構造を知らず、コンバーターに全て委譲する。

コンバーターは以下の変換を実装しなければならない:

- ATProtoレコード → front-matter付きMarkdown
- front-matter付きMarkdown → ATProtoレコード

各コンバーターはレコードタイプごとに独自のロジックを持つことができる。

## At-URIとMarkdownの変換仕様

レコードのAt-URIはMarkdownに変換する際にMarkdownファイルの保存場所で管理する

/entries/${collection}/${rkey}.md

コレクションが`com.example.test`、rkeyが`first-entry`の場合、

/entries/com.example.test/first-entry.md

となる。

### ディレクトリの自動作成

collectionに対応するディレクトリが存在しない場合、自動的に作成する。

### rkeyの制約

ファイルシステムで使用できない文字(`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`)がrkeyに含まれる場合、そのレコードはスキップされ、エラーログに記録される。

### コンバーターインターフェース

`@mkizka/atdown-core`は`IEntryConverter`インターフェースを提供する。各レコードタイプに対応するコンバーターは、このインターフェースを実装したnpmパッケージとして配布される。

レコードが単純なMarkdownではなく、WYSIWYGエディタで作成したデータ構造などでコンテンツを保持している場合でも、コンバーターで自由に変換ロジックを実装できる。

## 削除の扱い

現バージョンでは削除の同期は行わない。以下の挙動となる:

- ローカルでMarkdownファイルを削除 → PDSのレコードは残る
- PDSでレコードを削除 → ローカルのMarkdownファイルは残る

将来的にオプションフラグで削除同期を追加する可能性がある。

## エラーハンドリング

push/pull実行中に一部のエントリーで失敗が発生した場合、ベストエフォートで処理を継続する:

- 成功したエントリーの変更は保持される
- 失敗したエントリーはエラーログを出力し、スキップする
- 最終的に成功/失敗の件数を表示する

## 認証情報

パスワードは環境変数 `ATDOWN_PASSWORD` から読み込む。設定ファイルや永続ストレージには保存しない。

### Handle解決

`atdown.json`に記載された`handle`から、以下の情報を毎回解決する:

- PDS URL
- DID (Decentralized Identifier)

キャッシュは行わず、コマンド実行ごとに解決する。使用ケースとして頻繁にコマンドを実行することは想定されていないため、パフォーマンスの問題は発生しない。

## 複数コンバーターの同時使用

`atdown.json`の`converters`フィールドに複数のコンバーターパッケージを指定できる。

push/pull実行時、全てのコンバーターが順次実行され、それぞれが担当するコレクションのエントリーを同期する。

例:

```jsonc
{
  "handle": "example.test",
  "entriesDir": "./entries",
  "converters": [
    "@mkizka/atdown-whtwnd", // com.whtwnd.blog.entry
    "@mkizka/atdown-example", // com.example.test
  ],
}
```

この場合、`entries/com.whtwnd.blog.entry/`と`entries/app.bsky.feed.post/`の両方が同期される。

## WhiteWindコンバーターの仕様(`@mkizka/atdown-whtwnd`)

`@mkizka/atdown-whtwnd`はWhiteWindブログエントリー用のコンバーター実装である。

### 対象レコード

- `$type`: `com.whtwnd.blog.entry`
- レコード構造:
  - `content`: Markdown形式の本文
  - `createdAt`: 作成日時
  - `visibility`: 公開範囲
  - その他のフィールド

### 変換ロジック

**レコード → Markdown:**

- `content`フィールドをMarkdownの本文として抽出
- `$type`はファイルパスから自明なため除外
- 残りのフィールドをfront-matterに配置

例:

```json
{
  "$type": "com.whtwnd.blog.entry",
  "content": "## Markdown本文\nこれがコンテンツ",
  "createdAt": "2024-01-01T00:00:000Z",
  "visibility": "url"
}
```

↓

```md
---
createdAt: 2024-01-01T00:00:000Z
visibility: url
---

## Markdown本文

これがコンテンツ
```

**Markdown → レコード:**

- front-matterのフィールドをレコードに展開
- Markdown本文を`content`フィールドに配置
- `$type`に`com.whtwnd.blog.entry`を設定
