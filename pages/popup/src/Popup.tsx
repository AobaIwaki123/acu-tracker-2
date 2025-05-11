import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { t } from '@extension/i18n';
import { ToggleButton } from '@extension/ui';
import { useEffect, useState, useRef } from 'react';

interface ACUsValues {
  totalUsage: string | null;
  availableACUs: string | null;
  lastUpdated?: string;
}

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const [acusValues, setAcusValues] = useState<ACUsValues>({
    totalUsage: null,
    availableACUs: null,
  });
  const isLight = theme === 'light';
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 保存されたACUsの値を取得
    chrome.storage.local.get(['totalUsage', 'availableACUs', 'lastUpdated'], result => {
      setAcusValues({
        totalUsage: result.totalUsage || null,
        availableACUs: result.availableACUs || null,
        lastUpdated: result.lastUpdated,
      });
    });

    // 外クリック対策
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div ref={popupRef} className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <h1 className="text-xl font-bold mb-4">ACU Tracker for Devin</h1>

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

          {/* 最終更新時刻 */}
          {acusValues.lastUpdated && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
              Last updated: {formatLastUpdated(acusValues.lastUpdated)}
            </div>
          )}
        </div>

        <ToggleButton>{t('toggleTheme')}</ToggleButton>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
