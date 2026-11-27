// RumahAnggaran sample data — one job: the Rahma family's real November 2026 figures.
// Household of four in Jakarta: two parents, two school-age children. Amounts in rupiah (Rp).
// Income and spending below are the family's own records for November 2026; the six-month
// history is their ledger for June–November 2026. Category colours are shared with charts.js.

export const HOUSEHOLD = {
  name: "The Rahma family",
  place: "Jakarta, Indonesia",
  month: "November 2026",
  members: 4,
  note: "Two parents, two school-age children. One salary, one freelance income, a little interest.",
};

export const CATEGORIES = [
  { key: "housing", label: "Housing & Rent", color: "#0f766e" },
  { key: "food", label: "Food & Groceries", color: "#d97706" },
  { key: "transport", label: "Transport", color: "#1d4ed8" },
  { key: "utilities", label: "Utilities & Bills", color: "#7c3aed" },
  { key: "education", label: "Education", color: "#db2777" },
  { key: "health", label: "Health", color: "#15803d" },
  { key: "fun", label: "Fun & Eating Out", color: "#ea580c" },
  { key: "shopping", label: "Clothing & Household", color: "#475569" },
  { key: "income", label: "Income", color: "#15803d" },
  { key: "other", label: "Other", color: "#a8a29e" },
];

export function categoryLabel(key) {
  const found = CATEGORIES.find((c) => c.key === key);
  return found ? found.label : key;
}
export function categoryColor(key) {
  const found = CATEGORIES.find((c) => c.key === key);
  return found ? found.color : "#a8a29e";
}

// November 2026 ledger. id, date, description, category, type, amount (Rp).
export const TRANSACTIONS = [
  { id: "t01", date: "2026-11-01", desc: "Monthly salary — Budi (office)", cat: "income", type: "income", amount: 9800000 },
  { id: "t02", date: "2026-11-01", desc: "Rent — 2-bedroom house, Depok", cat: "housing", type: "expense", amount: 3200000 },
  { id: "t03", date: "2026-11-02", desc: "Weekly groceries — Pasar Minggu", cat: "food", type: "expense", amount: 612000 },
  { id: "t04", date: "2026-11-03", desc: "Freelance design — Sari (2 projects)", cat: "income", type: "income", amount: 1400000 },
  { id: "t05", date: "2026-11-05", desc: "Electricity token + water bill", cat: "utilities", type: "expense", amount: 385000 },
  { id: "t06", date: "2026-11-06", desc: "School fees — two children", cat: "education", type: "expense", amount: 1100000 },
  { id: "t07", date: "2026-11-08", desc: "Petrol + TransJakarta top-up", cat: "transport", type: "expense", amount: 420000 },
  { id: "t08", date: "2026-11-09", desc: "Weekly groceries — supermarket", cat: "food", type: "expense", amount: 588000 },
  { id: "t09", date: "2026-11-11", desc: "Doctor visit + medicine — Arka", cat: "health", type: "expense", amount: 450000 },
  { id: "t10", date: "2026-11-13", desc: "Internet + two mobile plans", cat: "utilities", type: "expense", amount: 265000 },
  { id: "t11", date: "2026-11-14", desc: "Family dinner out — Saturday", cat: "fun", type: "expense", amount: 342000 },
  { id: "t12", date: "2026-11-15", desc: "Savings interest — bank deposit", cat: "income", type: "income", amount: 300000 },
  { id: "t13", date: "2026-11-16", desc: "Weekly groceries — Pasar Minggu", cat: "food", type: "expense", amount: 640000 },
  { id: "t14", date: "2026-11-18", desc: "School uniforms + shoes", cat: "shopping", type: "expense", amount: 750000 },
  { id: "t15", date: "2026-11-20", desc: "Motor service + petrol", cat: "transport", type: "expense", amount: 480000 },
  { id: "t16", date: "2026-11-22", desc: "Cinema + snacks — family Sunday", cat: "fun", type: "expense", amount: 258000 },
  { id: "t17", date: "2026-11-24", desc: "Weekly groceries — supermarket", cat: "food", type: "expense", amount: 560000 },
  { id: "t18", date: "2026-11-26", desc: "Rice, oil, eggs — monthly stock", cat: "food", type: "expense", amount: 400000 },
];

// Monthly totals, June–November 2026, from the family ledger (Rp).
export const MONTHLY = [
  { month: "Jun 2026", income: 11200000, expense: 9850000 },
  { month: "Jul 2026", income: 11500000, expense: 10200000 },
  { month: "Aug 2026", income: 10900000, expense: 9900000 },
  { month: "Sep 2026", income: 11500000, expense: 10150000 },
  { month: "Oct 2026", income: 11500000, expense: 9980000 },
  { month: "Nov 2026", income: 11500000, expense: 10450000 },
];

// Planned budget per category for November 2026 (Rp).
export const PLANS = {
  housing: 3200000,
  food: 2500000,
  transport: 900000,
  utilities: 700000,
  education: 1200000,
  health: 500000,
  fun: 600000,
  shopping: 800000,
};

// Savings goals (Rp).
export const GOALS = [
  { id: "g1", name: "Emergency fund", target: 30000000, saved: 12500000, monthly: 1050000, note: "Six months of essential spending, kept in a separate savings account." },
  { id: "g2", name: "Family holiday — Yogyakarta", target: 6000000, saved: 2200000, monthly: 500000, note: "Train tickets, two nights, food and entry fees for four." },
  { id: "g3", name: "New motorbike down payment", target: 8000000, saved: 3000000, monthly: 750000, note: "Replacing the 2016 bike before it needs another big repair." },
];
