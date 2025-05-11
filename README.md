# ACU Tracker

DevinのACU使用状況を表示するChrome拡張機能

# Features

## Core

- UIの表示/非表示を切り替えられる
- Content Scriptで、`Usage & Limits`ページを定期的にポーリングして、ACU使用状況を取得する

## Extra

- ユーザーとDevinのチャット履歴から、Devinの稼働時間を計算し、時間あたりのACU効率 (min / ACU) を表示する
- 同様に、ACUあたりのコスト効率 (USD / ACU) を表示する

# Security

- 動作に必要な最小限の権限を用いる
- ユーザーに対して、いかなる情報も外部に送信しないことを明示する

# Debug

```bash
$ npx pnpm install
$ npx pnpm dev
```

1. Open Chrome and navigate to `chrome://extensions/`
2. Click `Load unpacked`
3. Select the `dist` folder

# Build

```bash
$ npx pnpm build
```

