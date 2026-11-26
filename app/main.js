// Japan in Numbers — the hash router.
//
// Routes: #/ overview, #/people, #/regions, #/economy. The router runs
// once on load and again on every hash change, so each section renders
// fully on first paint and is reachable by its own link.

import {
  bindPeople, bindRegions, bindTooltips, economyView, overviewView,
  peopleView, regionsView,
} from './views.js';

const ROUTES = {
  overview: { render: overviewView, bind: null, title: 'Japan in Numbers — overview' },
  people: { render: peopleView, bind: bindPeople, title: 'Japan in Numbers — people' },
  regions: { render: regionsView, bind: bindRegions, title: 'Japan in Numbers — regions' },
  economy: { render: economyView, bind: null, title: 'Japan in Numbers — economy & society' },
};

function currentRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '').split('/')[0] ?? '';
  if (raw !== '' && !Object.hasOwn(ROUTES, raw)) {
    // An unknown hash (a typo, an old bookmark) falls back to the
    // overview and the address bar is corrected to match.
    window.history.replaceState(null, '', '#/');
    return 'overview';
  }
  return raw === '' ? 'overview' : raw;
}

function render() {
  const name = currentRoute();
  const route = ROUTES[name];
  const app = document.getElementById('app');
  app.innerHTML = route.render();
  document.title = route.title;
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('data-nav') === name);
  });
  bindTooltips(app);
  if (route.bind) route.bind(app);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();
