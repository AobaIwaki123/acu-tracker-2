import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { t } from '@extension/i18n';
import { ToggleButton } from '@extension/ui';
import { useEffect, useState } from 'react';

interface ACUsValues {
  totalUsage: string | null;
  availableACUs: string | null;
}

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const [acusValues, setAcusValues] = useState<ACUsValues>({
    totalUsage: null,
    availableACUs: null,
  });
  const isLight = theme === 'light';
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  useEffect(() => {
    // 保存されたACUsの値を取得
    chrome.storage.local.get(['totalUsage', 'availableACUs'], result => {
      setAcusValues({
        totalUsage: result.totalUsage || null,
        availableACUs: result.availableACUs || null,
      });
    });
  }, []);

  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <button type="button" onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>

        {/* ACUsの値を表示 */}
        <div className="mt-4 space-y-4">
          {/* Total Usage */}
          {acusValues.totalUsage && (
            <div className="p-4 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#252525]">
              <div className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total Usage in this Cycle
              </div>
              <div className="text-3xl font-semibold text-neutral-900 dark:text-white">
                <span className="font-mono">{acusValues.totalUsage}</span>
                <span className="text-lg font-normal text-neutral-600 dark:text-neutral-400"> ACUs</span>
              </div>
            </div>
          )}

          {/* Available ACUs */}
          {acusValues.availableACUs && (
            <div className="p-4 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#252525]">
              <div className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Available ACUs</div>
              <div className="text-3xl font-semibold text-neutral-900 dark:text-white">
                <span className="font-mono">{acusValues.availableACUs}</span>
                <span className="text-lg font-normal text-neutral-600 dark:text-neutral-400"> ACUs</span>
              </div>
            </div>
          )}
        </div>

        <ToggleButton>{t('toggleTheme')}</ToggleButton>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
