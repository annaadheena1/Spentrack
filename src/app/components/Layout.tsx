import { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Home, TrendingUp, Receipt, Settings, Bell } from "lucide-react";
import { Badge } from "./ui/badge";
import { Logo } from "./Logo";
import { useAutoSMSSimulator } from "../hooks/useAutoSMSSimulator";
import { PurchaseNotification } from "./PurchaseNotification";
import { PURCHASE_DECISION_PROMPT_EVENT, type PurchaseDecisionPromptPayload } from "../hooks/useSMSProcessor";
import { useLiveTransactions } from "../hooks/useLiveTransactions";
import { useFinancialSettings } from "../hooks/useFinancialSettings";
import { useCurrency } from "../hooks/useCurrency";
import { generateSpendingFeedback, type SpendingContext } from "../lib/geminiService";
import { toast } from "sonner";

export function Layout() {
  const location = useLocation();
  const notifications = 2; // Mock notification count
  const isAutoSMSSimulatorEnabled = useAutoSMSSimulator();
  const { transactions, addTransaction } = useLiveTransactions();
  const { weeklyBudget, hourlyWage, balanceThreshold } = useFinancialSettings();
  const currency = useCurrency();
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseDecisionPromptPayload | null>(null);

  const currentBalance = transactions[0]?.balance ?? 0;
  const weeklySpent = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(startOfToday.getDate() - 6);

    return transactions
      .filter((transaction) => transaction.type === "debit" && transaction.date >= sevenDaysAgo)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onPurchasePrompt = (event: Event) => {
      const purchaseEvent = event as CustomEvent<PurchaseDecisionPromptPayload>;
      if (!purchaseEvent.detail) {
        return;
      }
      setSelectedPurchase(purchaseEvent.detail);
    };

    window.addEventListener(PURCHASE_DECISION_PROMPT_EVENT, onPurchasePrompt);

    return () => {
      window.removeEventListener(PURCHASE_DECISION_PROMPT_EVENT, onPurchasePrompt);
    };
  }, []);

  const closePurchasePrompt = () => {
    setSelectedPurchase(null);
  };

  const handlePurchaseSave = async () => {
    if (!selectedPurchase) {
      return;
    }

    const activePurchase = selectedPurchase;
    setSelectedPurchase(null);

    if (activePurchase.isCommitted) {
      toast.info("Transaction already happened", {
        description: "You can still save on the next one. This reminder is to build better spending habits.",
        duration: 4500,
      });
    }

    const amount = activePurchase.amount ?? activePurchase.avgSpend;
    const contextBalance = activePurchase.isCommitted ? currentBalance + amount : currentBalance;
    const contextWeeklySpent = activePurchase.isCommitted ? Math.max(0, weeklySpent - amount) : weeklySpent;

    const ctx: SpendingContext = {
      amount,
      avgSpend: activePurchase.avgSpend,
      currentBalance: contextBalance,
      weeklySpent: contextWeeklySpent,
      weeklyBudget,
    };

    const message = await generateSpendingFeedback(activePurchase.appName, ctx, "toast");
    toast.success(`🥂 ${message}`, { duration: 6000 });
  };

  const handlePurchaseContinue = async () => {
    if (!selectedPurchase) {
      return;
    }

    const activePurchase = selectedPurchase;
    setSelectedPurchase(null);

    const amount = activePurchase.amount ?? activePurchase.avgSpend;

    if (!activePurchase.isCommitted) {
      const purchaseResult = addTransaction({
        amount,
        merchant: activePurchase.appName,
        appName: activePurchase.appName,
        type: "debit",
      });

      if (
        purchaseResult &&
        !purchaseResult.isDuplicate &&
        purchaseResult.transaction.balance < balanceThreshold &&
        location.pathname !== "/dashboard"
      ) {
        toast.error("Low Balance Alert", {
          description: `Your balance is ${currency}${purchaseResult.transaction.balance.toFixed(2)}, below your ${currency}${balanceThreshold.toFixed(2)} threshold.`,
          duration: 6000,
        });
      }
    }

    const contextBalance = activePurchase.isCommitted ? currentBalance + amount : currentBalance;
    const contextWeeklySpent = activePurchase.isCommitted ? Math.max(0, weeklySpent - amount) : weeklySpent;

    const ctx: SpendingContext = {
      amount,
      avgSpend: activePurchase.avgSpend,
      currentBalance: contextBalance,
      weeklySpent: contextWeeklySpent,
      weeklyBudget,
    };

    const message = await generateSpendingFeedback(activePurchase.appName, ctx, "roast");
    const safeHourlyRate = Math.max(hourlyWage, 1);
    const workHours = amount / safeHourlyRate;

    toast.warning(
      `🔥 ${message} That's about ${workHours.toFixed(1)} work hours at ${currency}${safeHourlyRate.toFixed(2)}/hour.`,
      { duration: 12000 }
    );
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/dashboard/insights", icon: TrendingUp, label: "Insights" },
    { path: "/dashboard/transactions", icon: Receipt, label: "Transactions" },
    { path: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-900">SpenTrack</h1>
                  {isAutoSMSSimulatorEnabled && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      Auto SMS
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">Smart Expense Tracking</p>
              </div>
            </div>
            
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {notifications}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-white border-t border-slate-200 shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? "text-emerald-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <PurchaseNotification
        isOpen={!!selectedPurchase}
        appName={selectedPurchase?.appName ?? ""}
        appIcon={selectedPurchase?.appIcon ?? "💰"}
        avgSpend={selectedPurchase?.avgSpend ?? 0}
        amount={selectedPurchase?.amount}
        hourlyWage={hourlyWage}
        onClose={closePurchasePrompt}
        onSave={handlePurchaseSave}
        onContinue={handlePurchaseContinue}
      />
    </div>
  );
}
