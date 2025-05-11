import { sampleFunction } from './sampleFunction';

console.log('content script loaded');

// ACUsの値を取得する関数
const getACUsValues = () => {
  // 各要素を取得
  const totalUsageLabel = document.querySelector(
    '#radix-\\:r5\\:-content-overview > div > div.grid.grid-cols-3.gap-6 > div:nth-child(2) > div.mb-2.text-sm.font-medium.text-neutral-600.dark\\:text-neutral-400',
  );
  const availableACUsLabel = document.querySelector(
    '#radix-\\:r5\\:-content-overview > div > div.grid.grid-cols-3.gap-6 > div:nth-child(3) > div.mb-2.text-sm.font-medium.text-neutral-600.dark\\:text-neutral-400 > div',
  );

  // 親要素から値を取得
  const getValueFromParent = (labelElement: Element | null): string | null => {
    if (!labelElement) return null;

    // 親要素を取得
    const parentDiv = labelElement.closest('.rounded-lg.border.border-neutral-200');
    if (!parentDiv) return null;

    // 値の要素を取得
    const valueElement = parentDiv.querySelector('.text-3xl.font-semibold .font-mono');
    return valueElement ? valueElement.textContent : null;
  };

  // ラベルのテキストに基づいて値を分類
  let totalUsage = null;
  let availableACUs = null;

  if (totalUsageLabel?.textContent?.includes('Total Usage in this Cycle')) {
    totalUsage = getValueFromParent(totalUsageLabel);
  }

  if (availableACUsLabel?.textContent?.includes('Available ACUs')) {
    availableACUs = getValueFromParent(availableACUsLabel);
  }

  return {
    totalUsage,
    availableACUs,
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
