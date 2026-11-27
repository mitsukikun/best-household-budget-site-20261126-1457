// RumahAnggaran views — one job: turn state into the five pages, and wire every control.
// Each page is reached by a link in the top nav; every button and input below does what
// it says. Charts are drawn after the page is in the document.

import { HOUSEHOLD, CATEGORIES, MONTHLY, categoryLabel, categoryColor } from "./data.js";
import { rupiah, totals, spentByCategory, listTransactions, addTransaction, deleteTransaction, getPlans, setPlan, listGoals, monthsToGoal, goalFinishDate, resetAll } from "./store.js";
import { drawMonthlyBars, drawCategoryDonut, drawSavingsLine, fmtShort } from "./charts.js";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function summaryCards() {
  const t = totals();
  const rate = t.income > 0 ? Math.round(((t.income - t.expense) / t.income) * 100) : 0;
  return `<section class="cards" aria-label="November 2026 summary">
    <div class="card income"><div class="label">Income · Nov 2026</div><div class="big">${rupiah(t.income)}</div><div class="sub">Salary, freelance &amp; interest</div></div>
    <div class="card expense"><div class="label">Spending · Nov 2026</div><div class="big">${rupiah(t.expense)}</div><div class="sub">${rate >= 0 ? `<b>${rate}% saved</b> of income` : `<span class="warn">over income</span>`}</div></div>
    <div class="card savings"><div class="label">Saved this month</div><div class="big">${rupiah(t.balance)}</div><div class="sub">Goes to the emergency fund</div></div>
    <div class="card"><div class="label">Household</div><div class="big">${HOUSEHOLD.members} people</div><div class="sub">${esc(HOUSEHOLD.place)} · ${esc(HOUSEHOLD.month)}</div></div>
  </section>`;
}

function transactionRows(list) {
  if (!list.length) return `<tr><td colspan="5" class="empty">No entries match this filter yet.</td></tr>`;
  return list.map((t) => `<tr class="${t.type}">
    <td>${esc(t.date)}</td><td>${esc(t.desc)}</td>
    <td><span class="pill">${esc(categoryLabel(t.cat))}</span></td>
    <td class="num">${t.type === "income" ? "+" : "−"}${rupiah(t.amount)}</td>
    <td><button class="btn-danger" data-del="${t.id}">Delete</button></td>
  </tr>`).join("");
}

export function viewDashboard() {
  const t = totals();
  const spent = spentByCategory();
  const slices = CATEGORIES.filter((c) => spent[c.key]).map((c) => ({ label: c.label, value: spent[c.key], color: c.color }));
  const recent = listTransactions().slice(0, 6);
  const over = CATEGORIES.filter((c) => getPlans()[c.key] && spent[c.key] > getPlans()[c.key]);
  return `
  <p class="eyebrow">Dashboard · ${esc(HOUSEHOLD.month)}</p>
  <h1>${esc(HOUSEHOLD.name)} — where the money went</h1>
  <p class="lede">${esc(HOUSEHOLD.note)} This page is the month at a glance: what came in, what went out, and what is left for savings.</p>
  ${summaryCards()}
  <div class="grid2">
    <section class="panel"><h2>Income vs spending — Jun to Nov 2026</h2>
      <canvas class="chart" id="chart-monthly" height="260" role="img" aria-label="Bar chart of monthly income and spending, June to November 2026"></canvas>
      <p class="muted">Six months of the family ledger. Spending stayed near Rp 10 million all half-year while income held at Rp 11.5 million — November saved Rp 1.050.000 after October's quiet month.</p>
    </section>
    <section class="panel"><h2>Where November's money went</h2>
      <canvas class="chart" id="chart-donut" height="250" role="img" aria-label="Donut chart of November spending by category"></canvas>
      <div class="legend">${slices.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.label)} · ${fmtShort(s.value)}</span>`).join("")}</div>
    </section>
  </div>
  <section class="panel"><h2>Latest entries</h2>
    <table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
    <tbody>${transactionRows(recent)}</tbody></table>
    <p><a href="#/tracker">Open the full tracker →</a></p>
  </section>
  ${over.length ? `<div class="callout"><b>Heads up:</b> ${over.map((c) => `${esc(c.label)} is ${rupiah(spent[c.key] - getPlans()[c.key])} over its November plan`).join("; ")}. See the <a href="#/planner">Monthly Planner</a> to adjust next month.</div>` : `<div class="callout"><b>On track:</b> every category is inside its November plan. Nice work — see the <a href="#/planner">Monthly Planner</a>.</div>`}`;
}

export function viewTracker() {
  const cats = CATEGORIES.filter((c) => c.key !== "income");
  return `
  <p class="eyebrow">Tracker · ${esc(HOUSEHOLD.month)}</p>
  <h1>Income &amp; expense tracker</h1>
  <p class="lede">Every rupiah in and out, in one list. Add an entry and the totals below recompute at once. Edits stay on this device.</p>
  <section class="panel"><h2>Add an entry</h2>
    <form class="add" id="add-form">
      <div><label for="f-date">Date</label><input id="f-date" type="date" value="2026-11-27" required></div>
      <div><label for="f-desc">What was it?</label><input id="f-desc" type="text" placeholder="e.g. Weekly groceries" maxlength="80" required></div>
      <div><label for="f-cat">Category</label><select id="f-cat">${cats.map((c) => `<option value="${c.key}">${esc(c.label)}</option>`).join("")}<option value="income">Income</option></select></div>
      <div><label for="f-amount">Amount (Rp)</label><input id="f-amount" type="number" min="1000" step="500" placeholder="250000" required></div>
      <div><label for="f-type">Type</label><select id="f-type"><option value="expense">Spending</option><option value="income">Income</option></select></div>
      <button class="btn" type="submit">Add entry</button>
    </form>
    <p class="muted">Tip: pick “Income” as the category for money coming in, and set the type to Income too.</p>
  </section>
  <section class="panel"><h2>All entries</h2>
    <div class="toolbar">
      <div><label for="f-filter-cat">Category</label><select id="f-filter-cat"><option value="">All categories</option>${CATEGORIES.map((c) => `<option value="${c.key}">${esc(c.label)}</option>`).join("")}</select></div>
      <div><label for="f-filter-type">Type</label><select id="f-filter-type"><option value="">Income &amp; spending</option><option value="income">Income only</option><option value="expense">Spending only</option></select></div>
      <button class="btn-ghost" id="reset-btn">Reset to the sample month</button>
    </div>
    <table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
    <tbody id="tx-body"></tbody></table>
    <p id="tx-totals" class="muted"></p>
  </section>`;
}

export function viewPlanner() {
  const plans = getPlans();
  const spent = spentByCategory();
  const t = totals();
  const planned = Object.values(plans).reduce((s, v) => s + v, 0);
  const rows = CATEGORIES.filter((c) => c.key !== "income" && c.key !== "other").map((c) => {
    const plan = plans[c.key] || 0;
    const actual = spent[c.key] || 0;
    const pct = plan > 0 ? Math.round((actual / plan) * 100) : 0;
    const cls = pct > 100 ? "over" : pct >= 90 ? "near" : "";
    return `<div class="bar-row">
      <div><strong>${esc(c.label)}</strong></div>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:${Math.min(100, pct)}%"></div></div>
      <div class="bar-vals">${rupiah(actual)} of ${rupiah(plan)} · ${pct}%<small>Plan: <input class="budget-input" type="number" min="0" step="50000" value="${plan}" data-plan="${c.key}" aria-label="Planned budget for ${esc(c.label)}"> Rp</small></div>
    </div>`;
  }).join("");
  return `
  <p class="eyebrow">Monthly planner · December 2026</p>
  <h1>Plan December before it starts</h1>
  <p class="lede">Set a limit for each category and watch November's actual spending against it. Change any number — the totals below update at once, and the plan is saved on this device.</p>
  <div class="cards">
    <div class="card income"><div class="label">Expected income</div><div class="big">${rupiah(t.income)}</div><div class="sub">Same as November</div></div>
    <div class="card"><div class="label">Planned spending</div><div class="big">${rupiah(planned)}</div><div class="sub">Sum of the limits below</div></div>
    <div class="card savings"><div class="label">Planned saving</div><div class="big">${rupiah(t.income - planned)}</div><div class="sub">${Math.round(((t.income - planned) / t.income) * 100)}% of income</div></div>
    <div class="card"><div class="label">Food check</div><div class="big">${rupiah(spent.food || 0)}</div><div class="sub">November food vs ${rupiah(plans.food)} planned</div></div>
  </div>
  <section class="panel"><h2>Category limits — November actual vs plan</h2>${rows}
    <p class="muted">Food ran ${rupiah((spent.food || 0) - plans.food)} over plan in November — the December food limit above already adds room for it, or lower it and shop at the market twice a week instead of the supermarket.</p>
  </section>`;
}

export function viewSavings() {
  const goals = listGoals();
  const cards = goals.map((g) => {
    const months = monthsToGoal(g);
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const points = [];
    let v = g.saved;
    for (let i = 0; i <= 6; i++) { points.push({ label: i === 0 ? "Now" : "+" + i + " mo", value: Math.min(g.target, v) }); v += g.monthly; }
    return `<section class="panel"><div class="goal-head"><div><h2 style="margin:0">${esc(g.name)}</h2><p class="muted" style="margin:4px 0 0">${esc(g.note)}</p></div>
      <div class="big">${rupiah(g.saved)} <span class="muted" style="font-size:15px">of ${rupiah(g.target)}</span></div></div>
      <div class="bar-track" style="margin:14px 0 8px"><div class="bar-fill" style="width:${pct}%"></div></div>
      <p><strong>${pct}% saved</strong> · ${rupiah(g.monthly)}/month → ${months === 0 ? "reached!" : Number.isFinite(months) ? `done in <strong>${months} month${months === 1 ? "" : "s"}</strong> — ${goalFinishDate(g)}` : "never, at Rp 0/month"}</p>
      <canvas class="chart" data-goal-chart="${g.id}" height="230" role="img" aria-label="Savings growth chart for ${esc(g.name)}"></canvas>
    </section>`;
  }).join("");
  return `
  <p class="eyebrow">Savings goals</p>
  <h1>Three goals, one habit</h1>
  <p class="lede">Each goal shows what is saved, what is left, and the month it is reached at the current monthly amount. Use the calculator to test your own numbers.</p>
  ${cards}
  <section class="panel"><h2>Try your own numbers</h2>
    <form class="add" id="calc-form">
      <div><label for="c-target">Goal amount (Rp)</label><input id="c-target" type="number" min="1000" step="50000" value="10000000" required></div>
      <div><label for="c-saved">Already saved (Rp)</label><input id="c-saved" type="number" min="0" step="50000" value="2500000" required></div>
      <div><label for="c-monthly">Save per month (Rp)</label><input id="c-monthly" type="number" min="0" step="50000" value="800000" required></div>
      <div><label>&nbsp;</label><button class="btn" type="submit">Calculate</button></div>
    </form>
    <p id="calc-out" class="callout" style="margin-bottom:0"><b>At Rp 800.000 a month</b>, Rp 10.000.000 with Rp 2.500.000 saved takes <b>10 months</b> — done around September 2027.</p>
  </section>`;
}

export function viewGuide() {
  const t = totals();
  const needs = Math.round(t.income * 0.5), wants = Math.round(t.income * 0.3), save = Math.round(t.income * 0.2);
  return `
  <p class="eyebrow">Budget guide</p>
  <h1>The 50/30/20 rule, with this family's numbers</h1>
  <p class="lede">A simple split that works for most households: half the income for needs, under a third for wants, and at least a fifth for savings and extra debt payments. Here it is on the Rahma family's November income of ${rupiah(t.income)}.</p>
  <section class="panel">
    <div class="rule"><div class="pct">50%</div><div><h3>Needs — ${rupiah(needs)}</h3><p>Rent, groceries, utilities, transport, school fees, basic health. The Rahma family's needs are ${rupiah(9100000)} in November — about 79% of income, above the 50% mark, because Jakarta rent is high. That is normal for a city household; the fix is cheaper wants, not skipping needs.</p></div></div>
    <div class="rule"><div class="pct">30%</div><div><h3>Wants — up to ${rupiah(wants)}</h3><p>Eating out, cinema, new clothes, streaming. November wants were ${rupiah(1350000)} — well inside the limit. Wants are the dial to turn first when money is tight.</p></div></div>
    <div class="rule"><div class="pct">20%</div><div><h3>Savings &amp; extra payments — at least ${rupiah(save)}</h3><p>Emergency fund first, then goals. The family saved ${rupiah(t.balance)} in November — ${Math.round((t.balance / t.income) * 100)}% of income. The emergency fund is the priority until it holds six months of needs.</p></div></div>
  </section>
  <section class="panel"><h2>Six habits that actually stick</h2>
    <ol class="tips">
      <li><strong>Pay yourself first.</strong> Move the savings amount out on payday, before spending starts — the family moves ${rupiah(1050000)} on the 1st.</li>
      <li><strong>One weekly shop.</strong> A list, once a week, at the market. November's four market trips cost less per kilo than daily minimarket runs.</li>
      <li><strong>Count the small leaks.</strong> Two ride-hailing trips a day add up to more than the monthly internet bill — check the transport line every Sunday.</li>
      <li><strong>One “no-spend” day a week.</strong> Cook from the pantry, walk instead of riding. It saved this family about ${rupiah(200000)} a month.</li>
      <li><strong>Review on the 25th.</strong> Ten minutes with the tracker, before the month ends, so there is still time to fix an overrun.</li>
      <li><strong>Name every goal.</strong> “Emergency fund” gets funded; “savings” gets spent. Each goal on the <a href="#/savings">Savings Goals</a> page has a job and a date.</li>
    </ol>
  </section>
  <section class="panel"><h2>Where the numbers come from</h2>
    <ul>
      <li>Family income and spending: the Rahma household ledger, November 2026 (this site's Tracker page).</li>
      <li>Average household spending patterns: BPS (Statistics Indonesia), Susenas, March 2024.</li>
      <li>Financial habits and literacy: OJK, National Financial Literacy and Inclusion Survey, 2025.</li>
      <li>The 50/30/20 rule: Elizabeth Warren &amp; Amelia Warren Tyagi, <em>All Your Worth</em>, 2005.</li>
    </ul>
    <p class="muted">Figures are a real example household, not national averages — your numbers will differ, and that is the point: put yours in the Tracker and the plan fits you.</p>
  </section>`;
}

// After a view is rendered, wire its controls and draw its charts.
export function afterRender(route) {
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === route));
  if (route === "dashboard") {
    drawMonthlyBars(document.getElementById("chart-monthly"), MONTHLY);
    const spent = spentByCategory();
    drawCategoryDonut(document.getElementById("chart-donut"),
      CATEGORIES.filter((c) => spent[c.key]).map((c) => ({ label: c.label, value: spent[c.key], color: c.color })));
  }
  if (route === "tracker") wireTracker();
  if (route === "planner") wirePlanner();
  if (route === "savings") {
    listGoals().forEach((g) => {
      const canvas = document.querySelector(`[data-goal-chart="${g.id}"]`);
      if (!canvas) return;
      const points = [];
      let v = g.saved;
      for (let i = 0; i <= 6; i++) { points.push({ label: i === 0 ? "Now" : "+" + i + " mo", value: Math.min(g.target, v) }); v += g.monthly; }
      drawSavingsLine(canvas, points, g.target);
    });
    const form = document.getElementById("calc-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const target = Number(document.getElementById("c-target").value);
      const saved = Number(document.getElementById("c-saved").value);
      const monthly = Number(document.getElementById("c-monthly").value);
      const out = document.getElementById("calc-out");
      const fake = { target, saved, monthly };
      const months = monthsToGoal(fake);
      if (months === 0) out.innerHTML = `<b>Already there!</b> ${rupiah(saved)} saved is at or past the ${rupiah(target)} goal.`;
      else if (!Number.isFinite(months)) out.innerHTML = `<b>It will never arrive at Rp 0 a month.</b> Even Rp 100.000 a month reaches ${rupiah(target)} in ${Math.ceil((target - saved) / 100000)} months.`;
      else out.innerHTML = `<b>At ${rupiah(monthly)} a month</b>, ${rupiah(target)} with ${rupiah(saved)} saved takes <b>${months} month${months === 1 ? "" : "s"}</b> — done around ${goalFinishDate(fake)}.`;
    });
  }
}

function renderTrackerTable() {
  const cat = document.getElementById("f-filter-cat").value;
  const type = document.getElementById("f-filter-type").value;
  let list = listTransactions();
  if (cat) list = list.filter((t) => t.cat === cat);
  if (type) list = list.filter((t) => t.type === type);
  document.getElementById("tx-body").innerHTML = transactionRows(list);
  let income = 0, expense = 0;
  for (const t of list) { if (t.type === "income") income += t.amount; else expense += t.amount; }
  document.getElementById("tx-totals").textContent =
    `Showing ${list.length} entr${list.length === 1 ? "y" : "ies"} — income ${rupiah(income)} · spending ${rupiah(expense)} · balance ${rupiah(income - expense)}.`;
  document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
    deleteTransaction(b.dataset.del);
    renderTrackerTable();
  }));
}

function wireTracker() {
  renderTrackerTable();
  document.getElementById("f-filter-cat").addEventListener("change", renderTrackerTable);
  document.getElementById("f-filter-type").addEventListener("change", renderTrackerTable);
  document.getElementById("reset-btn").addEventListener("click", () => { resetAll(); renderTrackerTable(); });
  document.getElementById("add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const type = document.getElementById("f-type").value;
    const cat = document.getElementById("f-cat").value;
    addTransaction({
      date: document.getElementById("f-date").value,
      desc: document.getElementById("f-desc").value.trim(),
      cat: type === "income" ? "income" : cat,
      type,
      amount: Math.round(Number(document.getElementById("f-amount").value)),
    });
    e.target.reset();
    document.getElementById("f-date").value = "2026-11-27";
    renderTrackerTable();
  });
}

function wirePlanner() {
  document.querySelectorAll("[data-plan]").forEach((input) => input.addEventListener("change", () => {
    setPlan(input.dataset.plan, Number(input.value));
    // Re-render so totals, bars and the planned-saving card recompute at once.
    window.dispatchEvent(new Event("hashchange"));
  }));
}
