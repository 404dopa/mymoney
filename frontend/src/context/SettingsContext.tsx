import React, { createContext, useContext, useState, useEffect } from 'react';

export type MonthEndMode = 'same_day' | 'day_before';

interface SettingsContextType {
  monthStartDay: number;
  monthEndMode: MonthEndMode;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  saveSettings: (startDay: number, endMode?: MonthEndMode) => void;
}

const STORAGE_KEY_START_DAY = 'moneytrack_month_start_day';
const STORAGE_KEY_END_MODE = 'moneytrack_month_end_mode';

const SettingsContext = createContext<SettingsContextType>({
  monthStartDay: 1,
  monthEndMode: 'same_day',
  isSettingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  saveSettings: () => {},
});


export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monthStartDay, setMonthStartDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_START_DAY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 1 && val <= 31) {
          return val;
        }
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const [monthEndMode, setMonthEndMode] = useState<MonthEndMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_END_MODE);
      if (saved === 'same_day' || saved === 'day_before') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'same_day';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const saveSettings = (startDay: number, endMode: MonthEndMode = 'same_day') => {
    const clampedDay = Math.max(1, Math.min(31, Math.floor(startDay)));
    setMonthStartDay(clampedDay);
    setMonthEndMode(endMode);


    try {
      localStorage.setItem(STORAGE_KEY_START_DAY, String(clampedDay));
      localStorage.setItem(STORAGE_KEY_END_MODE, endMode);
    } catch {
      // ignore
    }

    closeSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        monthStartDay,
        monthEndMode,
        isSettingsOpen,
        openSettings,
        closeSettings,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
