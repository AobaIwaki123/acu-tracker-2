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
});

// 拡張機能のインストール時やアップデート時の処理
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated');
});
