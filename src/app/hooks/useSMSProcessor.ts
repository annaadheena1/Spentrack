import { useCallback } from "react";
import { toast } from "sonner";
import { useCurrency } from "./useCurrency";
import { useLiveTransactions } from "./useLiveTransactions";
import { parseAndStoreSMS, type ParseAndStoreSMSResult } from "../lib/smsParser";

interface ProcessSMSOptions {
  onHighSpendApp?: (appName: string, avgSpend: number, amount?: number) => void;
  showReceivedToast?: boolean;
  showTransactionToast?: boolean;
  sourceLabel?: string;
}

export function useSMSProcessor() {
  const currency = useCurrency();
  const { addTransaction } = useLiveTransactions();

  const processSMS = useCallback(async (
    text: string,
    options: ProcessSMSOptions = {}
  ): Promise<ParseAndStoreSMSResult> => {
    const userId = localStorage.getItem("userPhone") || "demo-user";
    const result = await parseAndStoreSMS(text, userId);

    if (!result.success) {
      toast.error("SMS parse failed", {
        description: result.message || "Could not parse simulated SMS.",
      });
      return result;
    }

    let announcedTransaction = false;

    if (result.parsed?.amount) {
      const addResult = addTransaction({
        amount: result.parsed.amount,
        merchant: result.parsed.merchant,
        appName: result.parsed.appName,
        timestamp: result.parsed.timestamp,
        type: "debit",
      });

      if (addResult && !addResult.isDuplicate && options.showTransactionToast !== false) {
        const prefix = options.sourceLabel ? `${options.sourceLabel}: ` : "";
        toast.info(
          `${prefix}-${currency}${addResult.transaction.amount.toFixed(2)}${
            addResult.transaction.merchant ? ` at ${addResult.transaction.merchant}` : ""
          }`,
          { duration: 4000 }
        );
        announcedTransaction = true;
      }
    }

    if (result.parsed?.appName && result.parsed.avgSpend && options.onHighSpendApp) {
      options.onHighSpendApp(result.parsed.appName, result.parsed.avgSpend, result.parsed.amount);
    }

    if (!announcedTransaction && options.showReceivedToast !== false) {
      toast.success("SMS received and parsed", {
        description: result.message || "The dashboard has been refreshed with simulated SMS data.",
      });
    }

    return result;
  }, [addTransaction, currency]);

  return { processSMS };
}