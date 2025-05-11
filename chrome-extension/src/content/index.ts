import 'webextension-polyfill';

// ACU使用量を取得する関数
const fetchAcusUsage = async () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'FETCH_ACUS_USAGE_PAGE' }, res => {
      if (res.success) {
        resolve(res.data);
      } else {
        reject(new Error(res.error));
      }
    });
  });
};

// ページ読み込み時に実行
const initialize = async () => {
  try {
    const data = await fetchAcusUsage();
    // データをストレージに保存
    chrome.storage.local.set(data);

    // ポップアップを表示
    chrome.runtime.sendMessage({
      action: 'SHOW_POPUP',
      acusValues: data,
    });
  } catch (error) {
    console.error('Failed to fetch ACUs info:', error);
  }
};

// ページが完全に読み込まれたら実行
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}
