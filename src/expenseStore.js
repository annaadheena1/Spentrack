// src/expenseStore.js
import { useState } from 'react';

export const useExpenseTracker = () => {
  const [data, setData] = useState({
    currentBalance: 1250.45,
    spentToday: 89.99,
    weeklySpent: 464.63,
    weeklyBudget: 600,
  });

  const processSMS = (message) => {
    // Regex to find numbers in the text
    const amountRegex = /(\d+(?:\.\d{1,2})?)/g;
    const matches = message.match(amountRegex);

    if (matches && matches.length >= 2) {
      const spent = parseFloat(matches[0]);
      const balance = parseFloat(matches[1]);

      setData((prev) => ({
        ...prev,
        spentToday: prev.spentToday + spent,
        weeklySpent: prev.weeklySpent + spent,
        currentBalance: balance,
      }));
    }
  };

  return { ...data, processSMS };
};