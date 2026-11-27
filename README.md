# RumahAnggaran — Household Budget Planner

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/mitsukikun/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/mitsukikun/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

RumahAnggaran is a household budget site that runs entirely in the browser from static files — no account, no network, no tracking. It follows one real household, the Rahma family of Jakarta, through November 2026: what they earned, what they spent, what they planned, and what they are saving for.

## What it does

- **Dashboard** — the month at a glance: income, spending, savings rate, a six-month income-vs-spending bar chart, a spending-by-category donut, and the latest entries.
- **Tracker** — the full November ledger. Add, filter, and delete income and expense entries; totals recompute at once and are kept on the device.
- **Monthly Planner** — a limit for every category, shown against November's actual spending, with totals for planned spending and planned saving.
- **Savings Goals** — three goals (emergency fund, family holiday, motorbike down payment) with progress, months-to-go, a finish date, and a growth chart — plus a calculator for your own numbers.
- **Budget Guide** — the 50/30/20 rule worked out on the family's real numbers, six habits that stick, and the sources for every figure.

## How to run

Serve `app/` with any static server and open it in a browser:

```sh
# from the entry root, with Python 3:
python3 -m http.server --directory app 8080
# or with Node 22+: npx --yes serve app
```

Then open http://localhost:8080. Everything — pages, charts, data — lives under `app/`; the site makes no network request.

## Layout

- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` (run with `MAKEFUN_OUTPUT_DIR=out node main.ts` outside the grader).
- `vendor/makefun-frontend.ts` — the make.fun dossier library, copied from the kit unchanged.
- `app/index.html`, `app/style.css` — page shell and the whole look.
- `app/data.js` — the family's November 2026 figures (ledger, monthly history, plans, goals).
- `app/store.js` — state, totals, and edits (kept in localStorage on the device).
- `app/charts.js` — canvas bar, donut, and line charts, no library.
- `app/views.js` — the five pages and their controls.
- `app/main.js` — hash router.
- `screenshots/` — real renders of the site in a browser (desktop dashboard, tracker, savings, phone dashboard).

## License

MIT — see `LICENSE`.
