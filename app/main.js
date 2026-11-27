// RumahAnggaran main — one job: route hash links to views and render them.
// Routes: #/ dashboard, #/tracker, #/planner, #/savings, #/guide. Unknown hashes fall
// back to the dashboard. No network, no framework: plain ES modules under app/.

import { viewDashboard, viewTracker, viewPlanner, viewSavings, viewGuide, afterRender } from "./views.js";

const ROUTES = {
  dashboard: viewDashboard,
  tracker: viewTracker,
  planner: viewPlanner,
  savings: viewSavings,
  guide: viewGuide,
};

function routeFromHash() {
  const hash = (location.hash || "#/").replace(/^#\//, "").replace(/\/$/, "");
  return ROUTES[hash] ? hash : "dashboard";
}

function render() {
  const route = routeFromHash();
  const view = document.getElementById("view");
  view.innerHTML = ROUTES[route]();
  afterRender(route);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
render();
