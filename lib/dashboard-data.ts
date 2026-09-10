export type SalesPoint = { date: string; daily: number; cumulative: number };

const daily = [42, 61, 55, 78, 96, 84, 112, 129, 118, 151, 177, 142, 165, 194, 186, 221, 208, 236, 254, 219, 276, 293, 268, 315, 344, 329, 372, 354];
let running = 2846;

export const salesSeries: SalesPoint[] = daily.map((value, index) => {
  running += value;
  return { date: `Aug ${index + 1}`, daily: value, cumulative: running };
});

const gross = 186420.32;
const printingFees = 48270.18;
const stripeGross = 52740.10;
const stripeTransactions = 640;
const stripeFeeRate = 0.031;
const stripeFixedFee = 0.30;
const stripeFees = Math.ceil((stripeGross * stripeFeeRate + stripeTransactions * stripeFixedFee) * 100) / 100;
const net = gross - printingFees - stripeFees;

export const metrics = {
  gross,
  printingFees,
  stripeGross,
  stripeTransactions,
  stripeFeeRate,
  stripeFixedFee,
  stripeFees,
  net,
  split: net / 2,
  copies: 9436,
  todayCopies: 354,
  weekGrowth: 18.4,
};

export const funnel = [
  { label: "Detail page views", value: 52180, rate: "100%" },
  { label: "Add to cart", value: 9422, rate: "18.1%" },
  { label: "Attributed purchases", value: 4186, rate: "44.4%" },
];

export const rankings = [
  { category: "Creativity Self-Help", current: 2, best: 1, movement: 1 },
  { category: "Business Motivation", current: 4, best: 2, movement: -1 },
  { category: "Personal Transformation", current: 11, best: 7, movement: 3 },
];

export const timeline = [
  { date: "Aug 28", title: "Creator excerpt reel", detail: "@readfromscratch · 184K plays", kind: "social" },
  { date: "Aug 24", title: "Amazon #1 milestone", detail: "Creativity Self-Help", kind: "milestone" },
  { date: "Aug 20", title: "Reader email: The Work Myth", detail: "42.8% open · 8.4% click", kind: "email" },
  { date: "Aug 15", title: "Podcast: Starting Over", detail: "9,240 tracked landing visits", kind: "press" },
];

export const sourceStatus = [
  { name: "KDP + master sheet", state: "Ready to connect", cadence: "Daily" },
  { name: "Meta / Instagram", state: "Ready to connect", cadence: "Daily" },
  { name: "Site analytics", state: "Ready to connect", cadence: "Hourly" },
  { name: "Amazon Attribution", state: "Ready to connect", cadence: "Daily" },
  { name: "Amazon data adapter", state: "Mock adapter", cadence: "Replaceable" },
];

export const dataUpdatedAt = "August 28, 2026 · 8:42 AM PT";
