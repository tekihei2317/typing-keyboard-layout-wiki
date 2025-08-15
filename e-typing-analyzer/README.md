# e-typing Word Analysis Tool

e-typingのワードファイルを分析し、ワード数や合計文字数等の指標を可視化するツールです。

## 機能

- **ワード数**: 総ワード数をカウント
- **平均ローマ字文字数**: 各ワードをローマ字変換した際の平均文字数
- **1トライアル期待文字数**: 15ワード × 平均文字数で算出される期待値
- **最初の文字分析**: 各文字の出現頻度をキーボード上に可視化

## 使用方法

### 1. 分析結果の生成

```bash
bun generate-analysis.ts
```

このコマンドで `data/analysis-results.json` が生成されます。

### 2. 可視化サーバーの起動

```bash
bun --hot server.ts
```

http://localhost:3000 にアクセスして結果を確認できます。

## 分析対象ファイル

現在は `../words/e-typing/夏のおやつ.xml` を分析対象としています。
新しいワードファイルを追加する場合は、`generate-analysis.ts` の `loadAndAnalyzeWords()` の引数を変更してください。

## 技術仕様

- **Runtime**: Bun
- **Language**: TypeScript
- **Frontend**: Vanilla JavaScript (DOM API)
- **XML Parser**: xml2js
- **Hot Reload**: Bun の HMR 機能を使用
