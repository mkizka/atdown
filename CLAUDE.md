# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要: 実装は開発途中です

このプロジェクトは開発途中であり、**[docs/spec.md](docs/spec.md) に記載された仕様が最も信頼できる情報源です**。実装と仕様が異なる場合は、仕様を優先してください。

## プロジェクト概要

atdownはMarkdownで表現可能なATProtoレコードをPDS(Personal Data Server)とローカルで同期・更新するCLIツールです。

- `atdown push`: ローカルのMarkdownファイルをPDSにアップロード
- `atdown pull`: PDSのレコードをローカルにMarkdownファイルとして保存

## コマンド

### 開発で使用する基本コマンド

```bash
# 全てのチェックを実行 (ビルド→型チェック→フォーマット→テスト)
pnpm all
```

## アーキテクチャ

### パッケージ構成

このプロジェクトはpnpm workspaceを使用したモノレポ構成です:

- `@mkizka/atdown-core`: 基本的な処理を実装するパッケージ
- `@mkizka/atdown`: coreパッケージを使用したCLI実装
- `@mkizka/atdown-whtwnd`: Markdownとレコードを変換するコンバーター

## 実装ルール

コードコメントは書かないでください。

## 仕様書

@docs/spec.md
