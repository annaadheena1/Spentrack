import { useEffect, useState } from "react";
import { generateSimulatedSpendingSMS, getAutoSMSSimulationDelay, getAutoSMSSimulationEnabled, AUTO_SMS_SETTINGS_UPDATED_EVENT, AUTO_SMS_ENABLED_STORAGE_KEY } from "../lib/smsSimulator";
import { useSMSProcessor } from "./useSMSProcessor";

export function useAutoSMSSimulator() {
  const { processSMS } = useSMSProcessor();
  const [isEnabled, setIsEnabled] = useState(() => getAutoSMSSimulationEnabled());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncEnabledState = () => {
      setIsEnabled(getAutoSMSSimulationEnabled());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== AUTO_SMS_ENABLED_STORAGE_KEY) {
        return;
      }
      syncEnabledState();
    };

    window.addEventListener(AUTO_SMS_SETTINGS_UPDATED_EVENT, syncEnabledState);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(AUTO_SMS_SETTINGS_UPDATED_EVENT, syncEnabledState);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled || typeof window === "undefined") {
      return;
    }

    let isCancelled = false;
    let timeoutId: number | undefined;

    const scheduleNext = (isInitialRun = false) => {
      timeoutId = window.setTimeout(async () => {
        if (isCancelled) {
          return;
        }

        if (!document.hidden) {
          await processSMS(generateSimulatedSpendingSMS(), {
            showReceivedToast: false,
            showTransactionToast: true,
            sourceLabel: "Auto SMS",
          });
        }

        if (!isCancelled) {
          scheduleNext(false);
        }
      }, getAutoSMSSimulationDelay(isInitialRun));
    };

    scheduleNext(true);

    return () => {
      isCancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isEnabled, processSMS]);

  return isEnabled;
}