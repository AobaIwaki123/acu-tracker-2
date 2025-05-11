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

# Pages <a name="structure-pages"></a>

Code that is transpiled to be part of the extension lives in the [pages](pages/) directory.

- [
  `content`](pages/content/) - [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
  (`content_scripts` in manifest.json)
- [`content-ui`](pages/content-ui) - React UI rendered in the current page (you can see it at the very bottom when you
  get started)
  (`content_scripts` in manifest.json)
- [
  `content-runtime`](pages/content-runtime/src/) - [injected content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#functionality);
  this can be injected from `popup` like standard `content`
- [
  `devtools`](pages/devtools/) - [extend the browser DevTools](https://developer.chrome.com/docs/extensions/how-to/devtools/extend-devtools#creating)
  (`devtools_page` in manifest.json)
- [
  `devtools-panel`](pages/devtools-panel/) - [DevTools panel](https://developer.chrome.com/docs/extensions/reference/api/devtools/panels)
  for [devtools](pages/devtools/src/index.ts)
- [
  `new-tab`](pages/new-tab/) - [override the default New Tab page](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
  (`chrome_url_overrides.newtab` in manifest.json)
- [`options`](pages/options/) - [options page](https://developer.chrome.com/docs/extensions/develop/ui/options-page)
  (`options_page` in manifest.json)
- [`popup`](pages/popup/) - [popup](https://developer.chrome.com/docs/extensions/reference/api/action#popup) shown when
  clicking the extension in the toolbar
  (`action.default_popup` in manifest.json)
- [
  `side-panel`](pages/side-panel/) - [sidepanel (Chrome 114+)](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
  (`side_panel.default_path` in manifest.json)

# Packages <a name="structure-packages"></a>

Some shared packages:

- `dev-utils` - utilities for Chrome extension development (manifest-parser, logger)
- `env` - exports object which contain all environment variables from `.env` and dynamically declared
- `hmr` - custom HMR plugin for Vite, injection script for reload/refresh, HMR dev-server
- `i18n` - custom internationalization package; provides i18n function with type safety and other validation
- `shared` - shared code for the entire project (types, constants, custom hooks, components etc.)
- `storage` - helpers for easier integration with [storage](https://developer.chrome.com/docs/extensions/reference/api/storage), e.g. local/session storages
- `tailwind-config` - shared Tailwind config for entire project
- `tsconfig` - shared tsconfig for the entire project
- `ui` - function to merge your Tailwind config with the global one; you can save components here
- `vite-config` - shared Vite config for the entire project

Other useful packages:

- `zipper` - run `pnpm zip` to pack the `dist` folder into `extension-YYYYMMDD-HHmmss.zip` inside the newly created
  `dist-zip`
- `module-manager` - run `pnpm module-manager` to enable/disable modules
- `e2e` - run `pnpm e2e` for end-to-end tests of your zipped extension on different browsers
