import { highSpendApps } from "./mockData";

export const AUTO_SMS_ENABLED_STORAGE_KEY = "spentrack:auto-sms-enabled";
export const AUTO_SMS_SETTINGS_UPDATED_EVENT = "spentrack:auto-sms-settings-updated";

const INITIAL_DELAY_MIN_MS = 4000;
const INITIAL_DELAY_MAX_MS = 8000;
const REPEAT_DELAY_MIN_MS = 12000;
const REPEAT_DELAY_MAX_MS = 22000;

interface SimulatedSMSScenario {
  merchant: string;
  minAmount: number;
  maxAmount: number;
}

const spendingScenarios: SimulatedSMSScenario[] = [
  { merchant: highSpendApps[0]?.name ?? "Amazon", minAmount: 24, maxAmount: 165 },
  { merchant: highSpendApps[1]?.name ?? "DoorDash", minAmount: 14, maxAmount: 48 },
  { merchant: highSpendApps[2]?.name ?? "Uber", minAmount: 9, maxAmount: 42 },
  { merchant: highSpendApps[3]?.name ?? "Target", minAmount: 18, maxAmount: 92 },
  { merchant: "Starbucks", minAmount: 5, maxAmount: 18 },
  { merchant: "Whole Foods", minAmount: 22, maxAmount: 96 },
  { merchant: "Netflix", minAmount: 9, maxAmount: 19 },
  { merchant: "Shell Gas Station", minAmount: 28, maxAmount: 74 },
  { merchant: "Apple Store", minAmount: 49, maxAmount: 249 },
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomAmount(min: number, max: number) {
  return Number.parseFloat(randomBetween(min, max).toFixed(2));
}

function randomCardSuffix() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function formatAmount(amount: number) {
  return amount.toFixed(2);
}

export function getAutoSMSSimulationEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  const stored = localStorage.getItem(AUTO_SMS_ENABLED_STORAGE_KEY);
  if (stored === null) {
    return true;
  }

  return stored === "true";
}

export function setAutoSMSSimulationEnabled(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTO_SMS_ENABLED_STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event(AUTO_SMS_SETTINGS_UPDATED_EVENT));
}

export function getAutoSMSSimulationDelay(isInitialRun: boolean) {
  return Math.round(
    randomBetween(
      isInitialRun ? INITIAL_DELAY_MIN_MS : REPEAT_DELAY_MIN_MS,
      isInitialRun ? INITIAL_DELAY_MAX_MS : REPEAT_DELAY_MAX_MS
    )
  );
}

export function generateSimulatedSpendingSMS() {
  const scenario = spendingScenarios[Math.floor(Math.random() * spendingScenarios.length)] ?? spendingScenarios[0];
  const amount = randomAmount(scenario.minAmount, scenario.maxAmount);
  const cardSuffix = randomCardSuffix();
  const templates = [
    `Bank alert: $${formatAmount(amount)} spent at ${scenario.merchant} on card xx${cardSuffix}.`,
    `Debit alert: USD ${formatAmount(amount)} paid to ${scenario.merchant} on card ending ${cardSuffix}.`,
    `Transaction notice: $${formatAmount(amount)} used at ${scenario.merchant} on your card xx${cardSuffix}.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)] ?? templates[0];
}