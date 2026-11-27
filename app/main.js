/*
 * Japan in Numbers - router.
 *
 * Hash routing only: #/overview, #/population, #/economy, #/society,
 * #/regions. The route is read on load and on every hashchange; the
 * matching view from views.js is rendered into the <main> element and
 * then mounted so its charts and controls can attach to the live DOM.
 */
"use strict";

const KNOWN_ROUTES = ["overview", "population", "economy", "society", "regions"];
const DEFAULT_ROUTE = "overview";

function routeFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, "").trim().toLowerCase();
  const first = raw.split("/")[0];
  return KNOWN_ROUTES.indexOf(first) >= 0 ? first : DEFAULT_ROUTE;
}

function setActiveNav(route) {
  document.querySelectorAll(".topnav a[data-nav]").forEach(function (a) {
    const on = a.getAttribute("data-nav") === route;
    a.classList.toggle("is-active", on);
    if (on) { a.setAttribute("aria-current", "page"); }
    else { a.removeAttribute("aria-current"); }
  });
}

function render() {
  const route = routeFromHash();
  const view = window.VIEWS[route] || window.VIEWS[DEFAULT_ROUTE];
  const main = document.getElementById("app");
  if (!main || !view) { return; }
  main.innerHTML = view.html();
  setActiveNav(route);
  document.title = "Japan in Numbers - " +
    route.charAt(0).toUpperCase() + route.slice(1);
  if (typeof view.mount === "function") {
    view.mount();
  }
}

window.addEventListener("hashchange", render);

// Redraw canvas charts after a resize settles, since canvas backing
// stores are sized from the layout width at mount time.
let resizeTimer = null;
window.addEventListener("resize", function () {
  if (resizeTimer !== null) { window.clearTimeout(resizeTimer); }
  resizeTimer = window.setTimeout(render, 180);
});

render();
