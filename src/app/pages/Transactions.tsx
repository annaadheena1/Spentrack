import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { motion } from "motion/react";
import { Calendar, Search, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { type Transaction } from "../lib/mockData";
import { useCurrency } from "../hooks/useCurrency";
import { useLiveTransactions } from "../hooks/useLiveTransactions";

export function Transactions() {
  const currency = useCurrency();
  const { transactions } = useLiveTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = Array.from(new Set(transactions.map((transaction) => transaction.category))).sort((a, b) =>
    a.localeCompare(b)
  );

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach((transaction) => {
      const dateKey = transaction.date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">View and filter all your transactions</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search merchants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="debit">Expenses</SelectItem>
                  <SelectItem value="credit">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {Object.entries(groupedTransactions).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No transactions found</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedTransactions).map(([date, transactions], groupIndex) => (
            <Card key={date}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <CardTitle className="text-lg">{date}</CardTitle>
                </div>
                <CardDescription>
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: groupIndex * 0.05 + index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'credit' 
                            ? 'bg-emerald-100' 
                            : 'bg-slate-100'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <ArrowDownRight className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-6 h-6 text-slate-600" />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-slate-900">{transaction.merchant}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {transaction.date.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          transaction.type === 'credit' 
                            ? 'text-emerald-600' 
                            : 'text-slate-900'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{currency}{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Balance: {currency}{transaction.balance.toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      {/* Summary Card */}
      {filteredTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-slate-900 text-white">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription className="text-slate-400">
                Based on filtered transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Total Transactions</p>
                  <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Spent</p>
                  <p className="text-2xl font-bold text-red-400">
                    {currency}{filteredTransactions
                      .filter(t => t.type === 'debit')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Income</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {currency}{filteredTransactions
                      .filter(t => t.type === 'credit')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Average Transaction</p>
                  <p className="text-2xl font-bold">
                    {currency}{(filteredTransactions
                      .filter(t => t.type === 'debit')
                      .reduce((sum, t) => sum + t.amount, 0) / 
                      filteredTransactions.filter(t => t.type === 'debit').length || 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}