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

// ACUsの値を取得して表示する関数
const handleACUsValues = () => {
  // app.devin.aiのドメインにアクセスしたときに実行
  if (window.location.hostname === 'app.devin.ai') {
    const { totalUsage, availableACUs } = getACUsValues();

    // 値が取得できた場合のみ保存
    if (totalUsage || availableACUs) {
      // 現在の値を保存
      chrome.storage.local.set({
        totalUsage,
        availableACUs,
        lastUpdated: new Date().toISOString(),
      });

      // ACUsの値をバックグラウンドスクリプトに送信
      chrome.runtime.sendMessage({
        action: 'SHOW_POPUP',
        acusValues: {
          totalUsage,
          availableACUs,
        },
      });
    } else {
      // 値が取得できない場合は、保存されている値を取得して表示
      chrome.storage.local.get(['totalUsage', 'availableACUs', 'lastUpdated'], result => {
        if (result.totalUsage || result.availableACUs) {
          chrome.runtime.sendMessage({
            action: 'SHOW_POPUP',
            acusValues: {
              totalUsage: result.totalUsage,
              availableACUs: result.availableACUs,
              lastUpdated: result.lastUpdated,
            },
          });
        }
      });
    }
  }
};

// ページロード時の処理
window.addEventListener('load', () => {
  sampleFunction();
  // ページロード完了後、少し待ってから値を取得（DOMの構築を待つため）
  setTimeout(handleACUsValues, 1000);
});
