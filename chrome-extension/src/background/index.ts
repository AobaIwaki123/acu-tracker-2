import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SHOW_POPUP') {
    // ACUsの値を保存
    if (message.acusValues) {
      chrome.storage.local.set({
        totalUsage: message.acusValues.totalUsage,
        availableACUs: message.acusValues.availableACUs,
      });
    }

    // アクティブなタブを取得
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        // ポップアップを表示
        chrome.action.openPopup();
      }
    });
  }

  if (message.action === 'FETCH_ACUS_VALUES') {
    fetch('https://app.devin.ai/settings/usage', {
      credentials: 'include', // ログイン済みのCookieを使う
    })
      .then(res => res.text())
      .then(html => {
        // HTMLを文字列として受け取り、DOM解析
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const getValue = (selector: string): string | null => {
          const el = doc.querySelector(selector);
          return el?.textContent?.trim() || null;
        };

        // TODO: 実際のセレクタに置き換える必要があります
        const totalUsage = getValue('.total-usage-selector');
        const availableACUs = getValue('.available-acus-selector');

        sendResponse({
          success: true,
          data: { totalUsage, availableACUs, lastUpdated: new Date().toISOString() },
        });
      })
      .catch(err => {
        console.error('[FETCH_ACUS_USAGE_PAGE] failed:', err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // 非同期応答
  }
});

// 拡張機能のインストール時やアップデート時の処理
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated');
});
