import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, Award, Target, Calendar } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useCurrency } from "../hooks/useCurrency";
import { useLiveTransactions } from "../hooks/useLiveTransactions";
import { useFinancialSettings } from "../hooks/useFinancialSettings";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

type TrendDirection = "up" | "down" | "stable";

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  trend: TrendDirection;
}

function sameMonth(date: Date, month: number, year: number) {
  return date.getMonth() === month && date.getFullYear() === year;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Insights() {
  const currency = useCurrency();
  const { transactions } = useLiveTransactions();
  const { monthlyBudget } = useFinancialSettings();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousYear = previousMonthDate.getFullYear();

  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const {
    projectedMonthlySpending,
    lastMonthSpending,
    savingsRate,
    topCategory,
    trendPercentage,
    isIncreasing,
    dailySpending,
    spendingByCategory,
    totalSpentThisMonth,
    currentMonthTransactionsCount,
    busiestDay,
    monthlyInsight,
  } = useMemo(() => {
    const currentMonthTransactions = transactions.filter((transaction) =>
      sameMonth(transaction.date, currentMonth, currentYear)
    );

    const currentMonthDebits = currentMonthTransactions.filter(
      (transaction) => transaction.type === "debit"
    );

    const currentMonthCredits = currentMonthTransactions.filter(
      (transaction) => transaction.type === "credit"
    );

    const totalSpent = currentMonthDebits.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalIncome = currentMonthCredits.reduce((sum, transaction) => sum + transaction.amount, 0);

    const lastMonthTotal = transactions
      .filter(
        (transaction) =>
          transaction.type === "debit" && sameMonth(transaction.date, previousMonth, previousYear)
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const daysElapsed = Math.max(1, now.getDate());
    const projectedSpend = (totalSpent / daysElapsed) * 30;

    const rawSavingsRate =
      totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;
    const computedSavingsRate = Math.max(0, Math.round(rawSavingsRate));

    const categoryTotals = currentMonthDebits.reduce((accumulator, transaction) => {
      accumulator.set(
        transaction.category,
        (accumulator.get(transaction.category) || 0) + transaction.amount
      );
      return accumulator;
    }, new Map<string, number>());

    const previousCategoryTotals = transactions
      .filter(
        (transaction) =>
          transaction.type === "debit" && sameMonth(transaction.date, previousMonth, previousYear)
      )
      .reduce((accumulator, transaction) => {
        accumulator.set(
          transaction.category,
          (accumulator.get(transaction.category) || 0) + transaction.amount
        );
        return accumulator;
      }, new Map<string, number>());

    const categories: CategorySpending[] = Array.from(categoryTotals.entries())
      .map(([category, amount]) => {
        const previousAmount = previousCategoryTotals.get(category) || 0;
        const trend: TrendDirection =
          amount > previousAmount ? "up" : amount < previousAmount ? "down" : "stable";

        return {
          category,
          amount,
          percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
          trend,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const topSpendingCategory =
      categories[0] ||
      ({
        category: "No spending yet",
        amount: 0,
        percentage: 0,
        trend: "stable",
      } satisfies CategorySpending);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date;
    });

    const dailyTotals = new Map<string, number>();
    transactions.forEach((transaction) => {
      if (transaction.type !== "debit") {
        return;
      }

      const key = formatShortDate(transaction.date);
      dailyTotals.set(key, (dailyTotals.get(key) || 0) + transaction.amount);
    });

    const spendingLast7Days = last7Days.map((date) => ({
      date: formatShortDate(date),
      amount: Number((dailyTotals.get(formatShortDate(date)) || 0).toFixed(2)),
    }));

    const monthDayTransactionCounts = currentMonthTransactions.reduce((accumulator, transaction) => {
      const dayKey = formatShortDate(transaction.date);
      accumulator.set(dayKey, (accumulator.get(dayKey) || 0) + 1);
      return accumulator;
    }, new Map<string, number>());

    let busiestDayLabel = "No activity yet";
    let busiestDayCount = 0;
    monthDayTransactionCounts.forEach((count, dayKey) => {
      if (count > busiestDayCount) {
        busiestDayCount = count;
        busiestDayLabel = dayKey;
      }
    });

    const budgetUsagePercent = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
    let insightText = "Keep going. Every intentional purchase strengthens your financial discipline.";

    if (budgetUsagePercent >= 100) {
      insightText = `You are over this month's budget by ${currency}${(totalSpent - monthlyBudget).toFixed(2)}. Time to tighten spending for the rest of the month.`;
    } else if (budgetUsagePercent >= 80) {
      insightText = `Heads up: you've already used ${budgetUsagePercent.toFixed(0)}% of your monthly budget. Prioritize essentials for the remaining days.`;
    } else if (budgetUsagePercent <= 50) {
      insightText = `Strong control this month: ${currency}${(monthlyBudget - totalSpent).toFixed(2)} is still available in your monthly budget.`;
    }

    const trendPercent =
      lastMonthTotal > 0
        ? ((projectedSpend - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    return {
      projectedMonthlySpending: projectedSpend,
      lastMonthSpending: lastMonthTotal,
      savingsRate: computedSavingsRate,
      topCategory: topSpendingCategory,
      trendPercentage: Math.abs(trendPercent).toFixed(1),
      isIncreasing: trendPercent >= 0,
      dailySpending: spendingLast7Days,
      spendingByCategory:
        categories.length > 0
          ? categories
          : [
              {
                category: "No spending yet",
                amount: 0,
                percentage: 0,
                trend: "stable" as const,
              },
            ],
      totalSpentThisMonth: totalSpent,
      currentMonthTransactionsCount: currentMonthTransactions.length,
      busiestDay: busiestDayLabel,
      monthlyInsight: insightText,
    };
  }, [
    currency,
    currentMonth,
    currentYear,
    monthlyBudget,
    now,
    previousMonth,
    previousYear,
    transactions,
  ]);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Spending Insights</h1>
            <p className="text-slate-600 mt-1">Understand your financial patterns</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            {monthLabel}
          </Badge>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Projected Monthly Spend</CardDescription>
              <CardTitle className="text-3xl">{currency}{projectedMonthlySpending.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isIncreasing ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">
                      +{trendPercentage}% vs last month
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-600 font-medium">
                      -{trendPercentage}% vs last month
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Top Category</CardDescription>
              <CardTitle className="text-3xl">{topCategory.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-600">
                  {currency}{topCategory.amount.toFixed(2)} ({topCategory.percentage}%)
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Savings Rate</CardDescription>
              <CardTitle className="text-3xl">{savingsRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 font-medium">
                  Based on this month's income vs spend
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Spending</CardTitle>
                <CardDescription>Your spending pattern over the last week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Distribution of your expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={spendingByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {spendingByCategory.map((entry, index) => (
                          <Cell key={`cell-${entry.category}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Detailed spending analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {spendingByCategory.map((category, index) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-slate-900">{category.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {currency}{category.amount.toFixed(2)}
                            </span>
                            {category.trend === "up" && <TrendingUp className="w-4 h-4 text-red-600" />}
                            {category.trend === "down" && <TrendingDown className="w-4 h-4 text-emerald-600" />}
                            {category.trend === "stable" && <Minus className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.max(2, category.percentage)}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Compare your spending across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spendingByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Monthly Wrap-up */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900">Monthly Wrap-up</CardTitle>
            <CardDescription className="text-indigo-700">{monthLabel} Summary (So Far)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">{currency}{totalSpentThisMonth.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-slate-600">Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{currentMonthTransactionsCount}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-slate-600">Most Spent On</p>
                <p className="text-lg font-bold text-slate-900">{topCategory.category}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-slate-600">Busiest Day</p>
                <p className="text-lg font-bold text-slate-900">{busiestDay}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-indigo-700 font-medium">Insight</p>
              <p className="text-slate-600 mt-1">{monthlyInsight}</p>
              <p className="text-xs text-slate-500 mt-2">
                Last month spend: {currency}{lastMonthSpending.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
