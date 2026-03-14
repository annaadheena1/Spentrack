import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { motion, useAnimation } from "motion/react";
import { 
  AlertCircle, 
  Sparkles, 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Coffee,
  Zap,
  Plus,
  Store
} from "lucide-react";
import { encouragementMessages, highSpendApps } from "../lib/mockData";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { MiscSpendingModal } from "../components/MiscSpendingModal";
import { AdminDebugSMSInput } from "../components/AdminDebugSMSInput";
import { useCurrency } from "../hooks/useCurrency";
import { useRealtimeBalance } from "../hooks/useRealtimeBalance";
import { useLiveTransactions } from "../hooks/useLiveTransactions";
import { emitPurchaseDecisionPrompt, useSMSProcessor } from "../hooks/useSMSProcessor";
import { useFinancialSettings } from "../hooks/useFinancialSettings";

export function Dashboard() {
  const currency = useCurrency();
  const { transactions, addTransaction } = useLiveTransactions();
  const { balanceThreshold, weeklyBudget } = useFinancialSettings();
  const { processSMS } = useSMSProcessor();
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [showMiscModal, setShowMiscModal] = useState(false);
  const [miscSpendings, setMiscSpendings] = useState<Array<{ id: string; amount: number; description: string; date: Date }>>([]);
  const [isLowBalanceFlash, setIsLowBalanceFlash] = useState(false);
  const nearLimitWarningShownRef = useRef(false);
  const overLimitWarningShownRef = useRef(false);
  const wasBelowThresholdRef = useRef(false);
  const balanceCardControls = useAnimation();

  useEffect(() => {
    balanceCardControls.start({ opacity: 1, y: 0, transition: { duration: 0.5 } });
  }, [balanceCardControls]);

  const currentBalance = transactions[0]?.balance ?? 0;
  const recentTransactions = transactions.slice(0, 5);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(startOfToday.getDate() - 6);

  const weeklySpent = transactions
    .filter((transaction) => transaction.type === "debit" && transaction.date >= sevenDaysAgo)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const spentToday = transactions
    .filter((transaction) => transaction.type === "debit" && transaction.date >= startOfToday)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const averageDailySpent = weeklySpent / 7;
  const budgetUsagePercent = weeklyBudget > 0 ? (weeklySpent / weeklyBudget) * 100 : 0;
  const budgetProgress = Math.min(100, Math.max(0, budgetUsagePercent));

  const handleAppWarning = useCallback((
    appName: string,
    avgSpend: number,
    amount?: number,
    isCommitted = false,
    appIcon?: string
  ) => {
    const app = highSpendApps.find((item) => item.name.toLowerCase() === appName.toLowerCase());
    emitPurchaseDecisionPrompt({
      appName,
      appIcon: appIcon || app?.icon || "💰",
      avgSpend,
      amount: amount ?? avgSpend,
      isCommitted,
    });
  }, []);

  useEffect(() => {
    if (currentBalance < balanceThreshold) {
      if (!wasBelowThresholdRef.current) {
        toast.error("Low Balance Alert", {
          description: `Your balance is ${currency}${currentBalance.toFixed(2)}, below your ${currency}${balanceThreshold.toFixed(2)} threshold.`,
          duration: 6000,
        });
      }

      wasBelowThresholdRef.current = true;
      return;
    }

    if (wasBelowThresholdRef.current) {
      toast.success("Balance Recovered", {
        description: `Your balance is back above ${currency}${balanceThreshold.toFixed(2)}. Keep the momentum going!`,
        duration: 4500,
      });
    }

    wasBelowThresholdRef.current = false;
  }, [balanceThreshold, currency, currentBalance]);

  useEffect(() => {
    const isNearLimit = budgetUsagePercent >= 80 && budgetUsagePercent < 100;

    if (isNearLimit && !nearLimitWarningShownRef.current) {
      toast.warning("Budget Limit Almost Over", {
        description: `You've used ${budgetUsagePercent.toFixed(0)}% of your weekly budget (${currency}${weeklySpent.toFixed(2)} / ${currency}${weeklyBudget.toFixed(2)}).`,
        duration: 6000,
      });
      nearLimitWarningShownRef.current = true;
    }

    if (!isNearLimit) {
      nearLimitWarningShownRef.current = false;
    }
  }, [budgetUsagePercent, currency, weeklyBudget, weeklySpent]);

  useEffect(() => {
    const isOverLimit = budgetUsagePercent >= 100;

    if (isOverLimit && !overLimitWarningShownRef.current) {
      toast.error("Budget Limit Reached", {
        description: `You are over your weekly limit by ${currency}${Math.max(0, weeklySpent - weeklyBudget).toFixed(2)}.`,
        duration: 7000,
      });
      overLimitWarningShownRef.current = true;
    }

    if (!isOverLimit) {
      overLimitWarningShownRef.current = false;
    }
  }, [budgetUsagePercent, currency, weeklyBudget, weeklySpent]);

  const triggerLowBalanceAlert = useCallback(async () => {
    setIsLowBalanceFlash(true);
    await balanceCardControls.start({
      x: [0, -14, 14, -10, 10, -6, 6, 0],
      transition: { duration: 0.6, ease: "easeInOut" },
    });
    setIsLowBalanceFlash(false);
  }, [balanceCardControls]);

  const registerIncomingTransaction = useCallback((params: {
    amount: number;
    merchant?: string;
    appName?: string;
    timestamp?: string;
    category?: string;
    type?: "debit" | "credit";
  }) => {
    const amount = Number(params.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const result = addTransaction({
      amount,
      merchant: params.merchant,
      appName: params.appName,
      timestamp: params.timestamp,
      category: params.category,
      type: params.type,
    });

    if (!result || result.isDuplicate) {
      return;
    }

    if (result.transaction.type === "debit") {
      handleAppWarning(
        params.appName || params.merchant || "Card Purchase",
        amount,
        amount,
        true
      );
    }

    if (result.transaction.balance < balanceThreshold) {
      void triggerLowBalanceAlert();
      return;
    }

    const direction = result.transaction.type === "credit" ? "+" : "-";
    toast.info(
      `💳 New transaction: ${direction}${currency}${result.transaction.amount.toFixed(2)}${
        result.transaction.merchant ? ` at ${result.transaction.merchant}` : ""
      }`,
      { duration: 4000 }
    );
  }, [addTransaction, balanceThreshold, currency, handleAppWarning, triggerLowBalanceAlert]);

  const handleRealtimeTransaction = useCallback((row: {
    amount?: number | string;
    merchant?: string;
    app_name?: string;
    received_at?: string;
  }) => {
    registerIncomingTransaction({
      amount: Number(row.amount),
      merchant: row.merchant,
      appName: row.app_name,
      timestamp: row.received_at,
      type: "debit",
    });
  }, [registerIncomingTransaction]);

  useRealtimeBalance({
    onNewTransaction: handleRealtimeTransaction,
  });

  const handleGoodChoice = () => {
    setShowEncouragement(true);
    const message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    toast.success(message, { duration: 3000 });
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => setShowEncouragement(false), 3000);
  };

  const handleAddMiscSpending = (description: string) => {
    // Find the last misc spending and update its description
    const lastMiscSpending = miscSpendings[0];
    if (lastMiscSpending && !lastMiscSpending.description) {
      const updatedSpendings = [...miscSpendings];
      updatedSpendings[0] = { ...lastMiscSpending, description };
      setMiscSpendings(updatedSpendings);
      toast.success(`Updated: ${description} - ${currency}${lastMiscSpending.amount.toFixed(2)}`);
    }
  };

  const handleMiscSpending = () => {
    // First, add a random transaction
    const randomAmount = Math.random() * 50 + 5; // Random amount between $5-$55
    const createdAt = new Date();
    const newSpending = {
      id: Date.now().toString(),
      amount: randomAmount,
      description: 'Miscellaneous', // Temporary description
      date: createdAt
    };
    setMiscSpendings([newSpending, ...miscSpendings]);

    const miscResult = addTransaction({
      amount: randomAmount,
      merchant: newSpending.description,
      category: "Miscellaneous",
      type: "debit",
      timestamp: createdAt.toISOString(),
    });

    if (miscResult && !miscResult.isDuplicate && miscResult.transaction.balance < balanceThreshold) {
      void triggerLowBalanceAlert();
    }
    
    // Then show notification asking what it was
    setTimeout(() => {
      toast.info("Hey, you just made a miscellaneous transaction! Wanna tell us what that was about?", {
        duration: 5000,
        action: {
          label: "Add Details",
          onClick: () => setShowMiscModal(true)
        },
      });
    }, 500);
  };

  const handleSimulateSMS = async (text: string) => {
    await processSMS(text, {
      showReceivedToast: true,
      showTransactionToast: true,
      showPurchasePrompt: true,
    });
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={balanceCardControls}
      >
        <Card className={`border-0 text-white shadow-xl transition-all duration-300 ${
          isLowBalanceFlash
            ? "bg-gradient-to-br from-red-500 to-rose-600 ring-4 ring-red-300"
            : "bg-gradient-to-br from-emerald-500 to-teal-600"
        }`}>
          <CardHeader>
            <CardDescription className="text-emerald-100">Current Balance</CardDescription>
            <CardTitle className="text-4xl font-bold">
              {currency}{currentBalance.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentBalance < balanceThreshold ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm text-emerald-100">Below threshold</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-200" />
                    <span className="text-sm text-emerald-100">Looking good!</span>
                  </>
                )}
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Threshold: {currency}{balanceThreshold}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Budget Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Budget</CardTitle>
                <CardDescription>Track your spending this week</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {currency}{weeklySpent.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500">of {currency}{weeklyBudget}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={budgetProgress} className="h-3" />
            <div className="flex justify-between mt-2 text-sm">
              <span className={budgetProgress > 80 ? "text-red-600 font-medium" : "text-slate-600"}>
                {budgetProgress.toFixed(0)}% used
              </span>
              <span className="text-slate-600">
                {currency}{(weeklyBudget - weeklySpent).toFixed(2)} remaining
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ArrowUpRight className="w-4 h-4" />
                <CardDescription>Spent Today</CardDescription>
              </div>
              <CardTitle className="text-2xl">{currency}{spentToday.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <ArrowDownRight className="w-4 h-4" />
                <CardDescription>Avg. Daily</CardDescription>
              </div>
              <CardTitle className="text-2xl">{currency}{averageDailySpent.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      {/* High-Spend Apps Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-amber-900">Smart Spending Alerts</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Apps you frequently spend money on
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {highSpendApps.map((app) => (
              <button
                key={app.name}
                onClick={() => handleAppWarning(app.name, app.avgSpend)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{app.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">{app.name}</p>
                    <p className="text-sm text-slate-500">Avg. {currency}{app.avgSpend}</p>
                  </div>
                </div>
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </button>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Last {Math.min(5, recentTransactions.length)} transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-500">No transactions yet.</p>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        {transaction.category === 'Shopping' && <ShoppingBag className="w-5 h-5 text-slate-600" />}
                        {transaction.category === 'Food & Dining' && <Coffee className="w-5 h-5 text-slate-600" />}
                        {transaction.category === 'Income' && <DollarSign className="w-5 h-5 text-emerald-600" />}
                        {!['Shopping', 'Food & Dining', 'Income'].includes(transaction.category) && (
                          <DollarSign className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{transaction.merchant}</p>
                        <p className="text-sm text-slate-500">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{currency}{transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {transaction.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Miscellaneous Spendings */}
      {miscSpendings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-purple-900">Miscellaneous Spendings</CardTitle>
                </div>
                <Badge className="bg-purple-200 text-purple-800 border-purple-300">
                  {miscSpendings.length} items
                </Badge>
              </div>
              <CardDescription className="text-purple-700">
                Small purchases and local store spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {miscSpendings.slice(0, 5).map((spending) => (
                  <div
                    key={spending.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{spending.description}</p>
                        <p className="text-sm text-slate-500">
                          {spending.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {currency}{spending.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              {miscSpendings.length > 5 && (
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  View All {miscSpendings.length} Items
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Misc Spending Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button
          onClick={handleMiscSpending}
          variant="outline"
          className="w-full border-2 border-dashed border-purple-300 hover:bg-purple-50 hover:border-purple-400 py-6"
        >
          <Plus className="w-5 h-5 mr-2 text-purple-600" />
          <span className="text-purple-700 font-medium">Add Miscellaneous Spending</span>
        </Button>
      </motion.div>

      {/* Spending Decision Helper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-emerald-900">Making a Purchase?</CardTitle>
            <CardDescription className="text-emerald-700">
              Think twice before you buy! Choose wisely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleGoodChoice}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              I'll Save Instead!
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (highSpendApps[0]) {
                  handleAppWarning(highSpendApps[0].name, highSpendApps[0].avgSpend);
                }
              }}
            >
              I Really Need This
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Misc Spending Modal */}
      {showMiscModal && (
        <MiscSpendingModal
          isOpen={showMiscModal}
          onClose={() => setShowMiscModal(false)}
          onAddSpending={handleAddMiscSpending}
        />
      )}

      <AdminDebugSMSInput onSimulateSMS={handleSimulateSMS} />
    </div>
  );
}