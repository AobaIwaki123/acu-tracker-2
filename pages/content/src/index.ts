import { sampleFunction } from './sampleFunction';

console.log('content script loaded');

interface ACUsValues {
  totalUsage: string | null;
  availableACUs: string | null;
  lastUpdated: string;
}

interface StorageResult {
  totalUsage?: string | null;
  availableACUs?: string | null;
  lastUpdated?: string;
}

// ACUsの値を取得する関数
const getACUsValues = async (doc: Document = document): Promise<ACUsValues> => {
  // 各要素を取得
  const totalUsageLabel = doc.querySelector(
    '#radix-\\:r5\\:-content-overview > div > div.grid.grid-cols-3.gap-6 > div:nth-child(2) > div.mb-2.text-sm.font-medium.text-neutral-600.dark\\:text-neutral-400',
  );
  const availableACUsLabel = doc.querySelector(
    '#radix-\\:r5\\:-content-overview > div > div.grid.grid-cols-3.gap-6 > div:nth-child(3) > div.mb-2.text-sm.font-medium.text-neutral-600.dark\\:text-neutral-400 > div',
  );

  // 値を取得するヘルパー関数
  const getValueFromParent = (labelElement: Element | null): string | null => {
    if (!labelElement) return null;
    const parentDiv = labelElement.closest('.rounded-lg.border.border-neutral-200');
    if (!parentDiv) return null;
    const valueElement = parentDiv.querySelector('.text-3xl.font-semibold .font-mono');
    return valueElement ? valueElement.textContent : null;
  };

  // 値を取得
  const totalUsage = totalUsageLabel?.textContent?.includes('Total Usage in this Cycle')
    ? getValueFromParent(totalUsageLabel)
    : null;
  const availableACUs = availableACUsLabel?.textContent?.includes('Available ACUs')
    ? getValueFromParent(availableACUsLabel)
    : null;

  if (totalUsage || availableACUs) {
    const acusValues: ACUsValues = {
      totalUsage,
      availableACUs,
      lastUpdated: new Date().toISOString(),
    };
    // 値を保存
    await chrome.storage.local.set(acusValues);
    return acusValues;
  }

  // 値が取得できない場合は保存されている値を返す
  return new Promise<ACUsValues>(resolve => {
    chrome.storage.local.get(['totalUsage', 'availableACUs', 'lastUpdated'], (result: StorageResult) => {
      const acusValues: ACUsValues = {
        totalUsage: result.totalUsage || null,
        availableACUs: result.availableACUs || null,
        lastUpdated: result.lastUpdated || new Date().toISOString(),
      };
      resolve(acusValues);
    });
  });
};

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'PING') {
    // PINGメッセージに対する応答
    sendResponse({ status: 'ok' });
    return true;
  }

  if (message.action === 'FETCH_ACUS_VALUES') {
    // ページの内容を取得
    fetch(window.location.href)
      .then(response => response.text())
      .then(async html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const acusValues = await getACUsValues(doc);
        sendResponse({ acusValues });
      })
      .catch(error => {
        console.error('Error fetching page content:', error);
        sendResponse({ error: 'Failed to fetch page content' });
      });
    return true;
  }
});

// ページロード時の処理
window.addEventListener('load', () => {
  sampleFunction();
  // ページロード完了後、少し待ってから値を取得（DOMの構築を待つため）
  setTimeout(async () => {
    if (window.location.hostname === 'app.devin.ai' && window.location.pathname === '/settings/usage') {
      const { totalUsage, availableACUs } = await getACUsValues();
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
