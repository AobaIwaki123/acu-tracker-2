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

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'FETCH_ACUS_VALUES') {
    // 現在のページのURLを確認
    if (window.location.hostname === 'app.devin.ai') {
      if (window.location.pathname === '/settings/usage') {
        // 現在のページから値を取得
        const { totalUsage, availableACUs } = getACUsValues();
        if (totalUsage || availableACUs) {
          const acusValues = {
            totalUsage,
            availableACUs,
            lastUpdated: new Date().toISOString(),
          };
          // 値を保存
          chrome.storage.local.set(acusValues);
          // レスポンスを送信
          sendResponse({ acusValues });
        } else {
          // 値が取得できない場合は保存されている値を返す
          chrome.storage.local.get(['totalUsage', 'availableACUs', 'lastUpdated'], result => {
            sendResponse({
              acusValues: {
                totalUsage: result.totalUsage,
                availableACUs: result.availableACUs,
                lastUpdated: result.lastUpdated,
              },
            });
          });
        }
      } else {
        // 別のページにいる場合は、usageページを取得
        fetch('https://app.devin.ai/settings/usage')
          .then(res => res.text())
          .then(html => {
            // 一時的なDOM要素を作成してHTMLを解析
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 必要な要素を取得
            const totalUsageLabel = doc.querySelector(
              '#radix-\\:r5\\:-content-overview > div > div.grid.grid-cols-3.gap-6 > div:nth-child(2) > div.mb-2.text-sm.font-medium.text-neutral-600.dark\\:text-neutral-400',
            );
            const availableACUsLabel = doc.querySelector(
              '#radix-\\:r5\\:-content-overview > div > div.grid.grid-cols-3.gap-6 > div:nth-child(3) > div.mb-2.text-sm.font-medium.text-neutral-600.dark\\:text-neutral-400 > div',
            );

            // 値を取得
            const getValueFromParent = (labelElement: Element | null): string | null => {
              if (!labelElement) return null;
              const parentDiv = labelElement.closest('.rounded-lg.border.border-neutral-200');
              if (!parentDiv) return null;
              const valueElement = parentDiv.querySelector('.text-3xl.font-semibold .font-mono');
              return valueElement ? valueElement.textContent : null;
            };

            const totalUsage = totalUsageLabel?.textContent?.includes('Total Usage in this Cycle')
              ? getValueFromParent(totalUsageLabel)
              : null;
            const availableACUs = availableACUsLabel?.textContent?.includes('Available ACUs')
              ? getValueFromParent(availableACUsLabel)
              : null;

            if (totalUsage || availableACUs) {
              const acusValues = {
                totalUsage,
                availableACUs,
                lastUpdated: new Date().toISOString(),
              };
              // 値を保存
              chrome.storage.local.set(acusValues);
              sendResponse({ acusValues });
            } else {
              // 値が取得できない場合は保存されている値を返す
              chrome.storage.local.get(['totalUsage', 'availableACUs', 'lastUpdated'], result => {
                sendResponse({
                  acusValues: {
                    totalUsage: result.totalUsage,
                    availableACUs: result.availableACUs,
                    lastUpdated: result.lastUpdated,
                  },
                });
              });
            }
          })
          .catch(err => {
            console.error('Error fetching usage page:', err);
            // エラーの場合は保存されている値を返す
            chrome.storage.local.get(['totalUsage', 'availableACUs', 'lastUpdated'], result => {
              sendResponse({
                acusValues: {
                  totalUsage: result.totalUsage,
                  availableACUs: result.availableACUs,
                  lastUpdated: result.lastUpdated,
                },
              });
            });
          });
      }
    } else {
      // app.devin.ai以外のドメインの場合は保存されている値を返す
      chrome.storage.local.get(['totalUsage', 'availableACUs', 'lastUpdated'], result => {
        sendResponse({
          acusValues: {
            totalUsage: result.totalUsage,
            availableACUs: result.availableACUs,
            lastUpdated: result.lastUpdated,
          },
        });
      });
    }
    return true; // 非同期レスポンス対応
  }
});

// ページロード時の処理
window.addEventListener('load', () => {
  sampleFunction();
  // ページロード完了後、少し待ってから値を取得（DOMの構築を待つため）
  setTimeout(() => {
    if (window.location.hostname === 'app.devin.ai' && window.location.pathname === '/settings/usage') {
      const { totalUsage, availableACUs } = getACUsValues();
      if (totalUsage || availableACUs) {
        chrome.storage.local.set({
          totalUsage,
          availableACUs,
          lastUpdated: new Date().toISOString(),
        });
      }
    }
  }, 1000);
});
