// RumahAnggaran store — one job: the family's money state and its arithmetic.
// Transactions start from data.js and live in localStorage after the first change,
// so the family's edits survive a reload and never leave this device.

import { TRANSACTIONS, PLANS, GOALS } from "./data.js";

const KEY = "rumahanggaran-v1";

export function rupiah(n) {
  return "Rp " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions)) return null;
    return parsed;
  } catch {
    return null;
  }
}

let state = load() || {
  transactions: TRANSACTIONS.map((t) => ({ ...t })),
  plans: { ...PLANS },
  goals: GOALS.map((g) => ({ ...g })),
};

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: keep in memory */ }
}

export function listTransactions() {
  return [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function totals() {
  let income = 0, expense = 0;
  for (const t of state.transactions) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

export function spentByCategory() {
  const out = {};
  for (const t of state.transactions) {
    if (t.type !== "expense") continue;
    out[t.cat] = (out[t.cat] || 0) + t.amount;
  }
  return out;
}

export function addTransaction(t) {
  const id = "u" + Date.now().toString(36);
  state.transactions.push({ id, ...t });
  save();
  return id;
}

export function deleteTransaction(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  save();
}

export function getPlans() { return { ...state.plans }; }

export function setPlan(cat, amount) {
  state.plans[cat] = Math.max(0, Math.round(amount) || 0);
  save();
}

export function listGoals() { return state.goals.map((g) => ({ ...g })); }

// Months from now until a goal is reached at a fixed monthly contribution.
// Returns 0 when already reached, Infinity when the contribution is 0.
// Counts from November 2026, the month this site's figures describe.
export function monthsToGoal(goal) {
  const remaining = goal.target - goal.saved;
  if (remaining <= 0) return 0;
  if (goal.monthly <= 0) return Infinity;
  return Math.ceil(remaining / goal.monthly);
}

export function goalFinishDate(goal) {
  const months = monthsToGoal(goal);
  if (!Number.isFinite(months)) return "—";
  const d = new Date(2026, 10 + months, 1); // November 2026 + months
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function resetAll() {
  state = {
    transactions: TRANSACTIONS.map((t) => ({ ...t })),
    plans: { ...PLANS },
    goals: GOALS.map((g) => ({ ...g })),
  };
  save();
}
