import { useEffect, useState } from "react";
import {
  FINANCIAL_SETTING_KEYS,
  FINANCIAL_SETTINGS_UPDATED_EVENT,
  type FinancialSettings,
  getFinancialSettings,
} from "../lib/financialSettings";

export function useFinancialSettings() {
  const [settings, setSettings] = useState<FinancialSettings>(() => getFinancialSettings());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncSettings = () => {
      setSettings(getFinancialSettings());
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key) {
        syncSettings();
        return;
      }

      const trackedKeys = Object.values(FINANCIAL_SETTING_KEYS);
      if (trackedKeys.includes(event.key as (typeof trackedKeys)[number])) {
        syncSettings();
      }
    };

    window.addEventListener(FINANCIAL_SETTINGS_UPDATED_EVENT, syncSettings);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(FINANCIAL_SETTINGS_UPDATED_EVENT, syncSettings);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return settings;
}
