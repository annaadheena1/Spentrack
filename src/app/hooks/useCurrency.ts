import { useState, useEffect } from "react";

const currencyMap: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "Fr",
  CNY: "¥",
  SGD: "S$",
};

export function useCurrency() {
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    const userCurrency = localStorage.getItem("userCurrency") || "USD";
    setCurrencySymbol(currencyMap[userCurrency] || "$");
  }, []);

  return currencySymbol;
}
