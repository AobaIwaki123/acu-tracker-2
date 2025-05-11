import { sampleFunction } from './sampleFunction';

console.log('content script loaded');

// ACUsの値を取得する関数
const getACUsValues = () => {
  const totalUsageElement = document.querySelector('.text-3xl.font-semibold .font-mono');
  const availableACUsElement = document.querySelector('.text-3xl.font-semibold .font-mono');

  return {
    totalUsage: totalUsageElement ? totalUsageElement.textContent : null,
    availableACUs: availableACUsElement ? availableACUsElement.textContent : null,
  };
};

// URLが変更されたときのイベントリスナー
const handleUrlChange = () => {
  if (window.location.href.includes('app.devin.ai/settings/usage')) {
    const { totalUsage, availableACUs } = getACUsValues();
    if (totalUsage || availableACUs) {
      // ACUsの値をバックグラウンドスクリプトに送信
      chrome.runtime.sendMessage({
        action: 'SHOW_POPUP',
        acusValues: {
          totalUsage,
          availableACUs,
        },
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
