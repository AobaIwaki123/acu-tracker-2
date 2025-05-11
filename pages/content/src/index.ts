import { sampleFunction } from './sampleFunction';

console.log('content script loaded');

// ACUsの値を取得する関数
const getACUsValue = (): string | null => {
  const acuElement = document.querySelector('.text-3xl.font-semibold .font-mono');
  return acuElement ? acuElement.textContent : null;
};

// URLが変更されたときのイベントリスナー
const handleUrlChange = () => {
  if (window.location.href.includes('app.devin.ai/settings/usage')) {
    const acusValue = getACUsValue();
    if (acusValue) {
      // ACUsの値をバックグラウンドスクリプトに送信
      chrome.runtime.sendMessage({
        action: 'SHOW_POPUP',
        acusValue: acusValue,
      });
    }
  }
};

// 初期チェック
handleUrlChange();

// URL変更を監視
const observer = new MutationObserver(() => {
  handleUrlChange();
});

// bodyの変更を監視
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// 履歴APIの変更を監視
const originalPushState = history.pushState;
history.pushState = function (...args: Parameters<typeof history.pushState>) {
  originalPushState.apply(this, args);
  handleUrlChange();
};

const originalReplaceState = history.replaceState;
history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
  originalReplaceState.apply(this, args);
  handleUrlChange();
};

// ページロード時の処理
window.addEventListener('load', () => {
  sampleFunction();
  handleUrlChange();
});
