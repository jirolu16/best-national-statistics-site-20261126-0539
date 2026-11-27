/*
 * Japan in Numbers - views.
 *
 * Each section is a small object with an html() renderer and an
 * optional mount() hook that runs after the markup is in the DOM
 * (canvas charts and interactive controls live there). Everything is
 * rendered from window.JAPAN_DATA and window.SITE_META; nothing is
 * fetched and nothing is random, so first paint is the final paint.
 */
"use strict";

const D = window.JAPAN_DATA;
const M = window.SITE_META;

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sectionHead(kicker, title, lede) {
  return (
    '<div class="section-head">' +
    '<p class="section-kicker">' + esc(kicker) + "</p>" +
    '<h1 class="section-title">' + esc(title) + "</h1>" +
    '<p class="section-lede">' + esc(lede) + "</p>" +
    "</div>"
  );
}

function statCard(ind) {
  return (
    '<div class="stat-card">' +
    '<span class="stat-value">' + esc(ind.value) + "</span>" +
    '<span class="stat-label">' + esc(ind.label) + "</span>" +
    '<span class="stat-note">' + esc(ind.note) + "</span>" +
    "</div>"
  );
}

function headlineCards(ids) {
  const byId = {};
  M.indicators.forEach(function (ind) { byId[ind.id] = ind; });
  return ids.map(function (id) { return statCard(byId[id]); }).join("");
}

/* ---------- canvas helpers ---------- */

function prepareCanvas(canvas, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 720;
  canvas.style.height = cssHeight + "px";
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, w: cssWidth, h: cssHeight };
}

function drawLineChart(canvas, points, opts) {
  const box = prepareCanvas(canvas, opts.height || 320);
  const ctx = box.ctx;
  const padL = 52, padR = 14, padT = 16, padB = 30;
  const plotW = box.w - padL - padR;
  const plotH = box.h - padT - padB;
  const xs = points.map(function (p) { return p[0]; });
  const ys = points.map(function (p) { return p[1]; });
  const xMin = opts.xMin !== undefined ? opts.xMin : Math.min.apply(null, xs);
  const xMax = opts.xMax !== undefined ? opts.xMax : Math.max.apply(null, xs);
  let yMin = opts.yMin !== undefined ? opts.yMin : Math.min.apply(null, ys);
  let yMax = opts.yMax !== undefined ? opts.yMax : Math.max.apply(null, ys);
  if (yMax === yMin) { yMax = yMin + 1; }
  const yPad = (yMax - yMin) * 0.12;
  yMin -= yPad; yMax += yPad;

  function X(year) { return padL + (year - xMin) / (xMax - xMin) * plotW; }
  function Y(val) { return padT + (yMax - val) / (yMax - yMin) * plotH; }

  ctx.font = "11px sans-serif";
  ctx.lineWidth = 1;

  // horizontal gridlines with y labels, 4 bands
  ctx.strokeStyle = "#d7dce4";
  ctx.fillStyle = "#3c4a63";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (yMax - yMin) * i / 4;
    const y = Y(v);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    ctx.fillText(v.toFixed(opts.decimals || 0), padL - 6, y + 3);
  }

  // x labels: first, last, and roughly every step
  ctx.textAlign = "center";
  const step = Math.max(1, Math.round(points.length / 5));
  points.forEach(function (p, i) {
    if (i % step === 0 || i === points.length - 1) {
      ctx.fillText(String(p[0]), X(p[0]), box.h - 10);
    }
  });

  // the line itself
  ctx.strokeStyle = "#bc002d";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  points.forEach(function (p, i) {
    if (i === 0) { ctx.moveTo(X(p[0]), Y(p[1])); }
    else { ctx.lineTo(X(p[0]), Y(p[1])); }
  });
  ctx.stroke();

  // point markers
  ctx.fillStyle = "#14213d";
  points.forEach(function (p) {
    ctx.beginPath();
    ctx.arc(X(p[0]), Y(p[1]), 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // axis baseline
  ctx.strokeStyle = "#aeb8c6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();
}

function drawValueBars(canvas, bars, opts) {
  const box = prepareCanvas(canvas, opts.height || 240);
  const ctx = box.ctx;
  const padL = 16, padR = 16, padT = 26, padB = 30;
  const plotW = box.w - padL - padR;
  const plotH = box.h - padT - padB;
  const max = Math.max.apply(null, bars.map(function (b) { return b.value; })) * 1.12;
  const slot = plotW / bars.length;
  const barW = Math.min(150, slot * 0.52);

  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  bars.forEach(function (b, i) {
    const cx = padL + slot * i + slot / 2;
    const h = b.value / max * plotH;
    const y = padT + plotH - h;
    ctx.fillStyle = b.color;
    ctx.fillRect(cx - barW / 2, y, barW, h);
    ctx.fillStyle = "#14213d";
    ctx.font = "700 14px sans-serif";
    ctx.fillText(b.valueLabel, cx, y - 8);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#3c4a63";
    ctx.fillText(b.label, cx, padT + plotH + 18);
  });
  ctx.strokeStyle = "#aeb8c6";
  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();
}

/* ---------- overview ---------- */

const OverviewView = {
  html: function () {
    const facts = D.glanceFacts.map(function (f) {
      return '<div class="fact"><dt>' + esc(f.label) + "</dt><dd>" +
        esc(f.value) + "</dd></div>";
    }).join("");
    const cards = [
      ["population", "Population", "Six decades of growth, a 2008 peak, and the gentle decline since."],
      ["economy", "Economy", "GDP trend, work, and the near-even trade balance of 2023."],
      ["society", "Society", "Long lives, smaller households, and near-universal schooling."],
      ["regions", "Regions", "The ten largest prefectures and the weight of Greater Tokyo."]
    ].map(function (c) {
      return '<a class="section-card" href="#/' + c[0] + '"><h3>' + c[1] +
        "</h3><p>" + c[2] + "</p></a>";
    }).join("");
    return (
      sectionHead("National overview", "Japan, in four numbers first",
        "The headline indicators below frame everything else on this site: a large, long-lived population that has begun to shrink, and an economy of the first rank.") +
      '<section class="hero"><h2 class="hero-title">Headline indicators</h2>' +
      '<p class="hero-sub">Latest published figures; reference years in the notes.</p>' +
      '<div class="stat-grid">' +
      headlineCards(["population-2024", "gdp-2023", "median-age", "life-expectancy"]) +
      "</div></section>" +
      '<section class="block"><h2 class="block-title">Population, 1960 to 2024</h2>' +
      '<div class="chart-frame"><canvas id="ov-pop-chart"></canvas>' +
      '<p class="chart-caption">Total population, millions of people. The series peaks at 128.1 million in 2008 and 2010, then eases to 123.8 million by 2024.</p></div></section>' +
      '<section class="block"><h2 class="block-title">Japan at a glance</h2>' +
      '<dl class="fact-grid">' + facts + "</dl></section>" +
      '<section class="block"><h2 class="block-title">Explore the sections</h2>' +
      '<div class="card-strip">' + cards + "</div></section>"
    );
  },
  mount: function () {
    const c = document.getElementById("ov-pop-chart");
    if (c) { drawLineChart(c, D.populationSeries, { decimals: 0, height: 320 }); }
  }
};

/* ---------- population ---------- */

function ageBarRows(yearKey) {
  const s = D.ageShares[yearKey];
  const rows = [
    ["Aged 0-14", s.young, "is-young"],
    ["Aged 15-64", s.working, ""],
    ["Aged 65+", s.elderly, "is-elderly"]
  ];
  return rows.map(function (r) {
    return '<div class="age-row"><span>' + r[0] + '</span>' +
      '<span class="age-track"><span class="age-fill ' + r[2] +
      '" style="display:block;width:' + r[1] + '%"></span></span>' +
      '<span class="age-pct">' + r[1].toFixed(1) + "%</span></div>";
  }).join("");
}

const PopulationView = {
  html: function () {
    const f = D.populationFacts;
    return (
      sectionHead("Population", "Fewer people, older people",
        "Japan counted 126.15 million people in the 2020 census. The estimate for 2024 is 123.8 million, and nearly three residents in ten are 65 or older.") +
      '<section class="block"><h2 class="block-title">Choose a period</h2>' +
      '<div class="chart-frame"><canvas id="pop-chart"></canvas>' +
      '<div class="range-controls">' +
      '<label>From year <output id="yr-from-out">1960</output>' +
      '<input type="range" id="yr-from" min="1960" max="2024" step="1" value="1960"></label>' +
      '<label>To year <output id="yr-to-out">2024</output>' +
      '<input type="range" id="yr-to" min="1960" max="2024" step="1" value="2024"></label>' +
      "</div>" +
      '<p class="chart-caption" id="pop-summary"></p></div></section>' +
      '<section class="block"><h2 class="block-title">Age structure, share of population</h2>' +
      "<h3>1990</h3>" + '<div class="age-bars">' + ageBarRows("1990") + "</div>" +
      "<h3>2024</h3>" + '<div class="age-bars">' + ageBarRows("2024") + "</div>" +
      '<p class="block-note">The elderly share more than doubled between 1990 and 2024, from 12.1% to 29.0%, while the share of children fell from 18.2% to 11.4%.</p></section>' +
      '<section class="block"><h2 class="block-title">Key figures</h2>' +
      '<table class="data kv-table"><tbody>' +
      "<tr><td>Median age</td><td>" + f.medianAge.toFixed(1) + " years</td></tr>" +
      "<tr><td>Fertility rate (2023)</td><td>" + f.fertility2023.toFixed(2) + " children per woman</td></tr>" +
      "<tr><td>Life expectancy, both sexes</td><td>" + f.lifeExpectancy.both.toFixed(1) + " years</td></tr>" +
      "<tr><td>Life expectancy, men</td><td>" + f.lifeExpectancy.men.toFixed(1) + " years</td></tr>" +
      "<tr><td>Life expectancy, women</td><td>" + f.lifeExpectancy.women.toFixed(1) + " years</td></tr>" +
      "</tbody></table></section>"
    );
  },
  mount: function () {
    const fromEl = document.getElementById("yr-from");
    const toEl = document.getElementById("yr-to");
    const fromOut = document.getElementById("yr-from-out");
    const toOut = document.getElementById("yr-to-out");
    const summary = document.getElementById("pop-summary");
    const canvas = document.getElementById("pop-chart");
    if (!fromEl || !toEl || !canvas) { return; }

    function valueAt(year) {
      let best = null;
      D.populationSeries.forEach(function (p) {
        if (best === null || Math.abs(p[0] - year) < Math.abs(best[0] - year)) { best = p; }
      });
      return best;
    }

    function redraw() {
      let a = parseInt(fromEl.value, 10);
      let b = parseInt(toEl.value, 10);
      if (a > b) { const t = a; a = b; b = t; }
      fromOut.textContent = String(a);
      toOut.textContent = String(b);
      const pts = D.populationSeries.filter(function (p) { return p[0] >= a && p[0] <= b; });
      const shown = pts.length >= 2 ? pts : D.populationSeries;
      drawLineChart(canvas, shown, { decimals: 0, height: 320, xMin: a, xMax: b });
      const va = valueAt(a), vb = valueAt(b);
      const change = vb[1] - va[1];
      const pct = change / va[1] * 100;
      summary.textContent =
        "Nearest published points: " + va[1].toFixed(1) + "M in " + va[0] +
        " and " + vb[1].toFixed(1) + "M in " + vb[0] + ", a change of " +
        (change >= 0 ? "+" : "") + change.toFixed(1) + "M (" +
        (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%).";
    }

    fromEl.addEventListener("input", redraw);
    toEl.addEventListener("input", redraw);
    redraw();
  }
};

/* ---------- economy ---------- */

const EconomyView = {
  html: function () {
    const e = D.economyFacts;
    return (
      sectionHead("Economy", "Large, open, and nearly balanced on trade",
        "Gross domestic product was 4.21 trillion US dollars in 2023. Exports and imports of goods and services were within a billion dollars of each other.") +
      '<section class="block"><h2 class="block-title">GDP, 2000 to 2023</h2>' +
      '<div class="chart-frame"><canvas id="eco-gdp-chart"></canvas>' +
      '<p class="chart-caption">GDP in trillion US dollars, current prices (World Bank). The yen exchange rate moves this series strongly: note the 2012 high of 6.27 trillion and the slide after 2021.</p></div></section>' +
      '<section class="block"><h2 class="block-title">Key figures</h2>' +
      '<div class="stat-grid">' +
      statCard({ value: "$33,800", label: "GDP per capita (2023)", note: "US dollars, World Bank" }) +
      statCard({ value: e.unemploymentPct.toFixed(1) + "%", label: "Unemployment", note: "Labour Force Survey" }) +
      statCard({ value: e.labourForceMillions.toFixed(1) + "M", label: "Labour force", note: "Persons aged 15 and over" }) +
      statCard({ value: "4.21T", label: "GDP (2023)", note: "Trillion US dollars" }) +
      "</div></section>" +
      '<section class="block"><h2 class="block-title">Exports against imports, 2023</h2>' +
      '<div class="chart-frame"><canvas id="eco-trade-chart"></canvas>' +
      '<p class="chart-caption">Billion US dollars. Exports 785, imports 786: a gap of one billion on flows of more than three quarters of a trillion each way.</p></div></section>'
    );
  },
  mount: function () {
    const g = document.getElementById("eco-gdp-chart");
    if (g) { drawLineChart(g, D.gdpSeries, { decimals: 1, height: 320 }); }
    const t = document.getElementById("eco-trade-chart");
    if (t) {
      drawValueBars(t, [
        { label: "Exports 2023", value: D.trade2023.exportsBn, valueLabel: "785B", color: "#14213d" },
        { label: "Imports 2023", value: D.trade2023.importsBn, valueLabel: "786B", color: "#bc002d" }
      ], { height: 240 });
    }
  }
};

/* ---------- society ---------- */

const SocietyView = {
  html: function () {
    const s = D.society;
    const f = D.populationFacts;
    return (
      sectionHead("Society", "Long lives in smaller households",
        "A Japanese newborn can expect 84.0 years of life. Households keep shrinking: the average is now about 2.2 people, and more than a third are one-person households.") +
      '<section class="block"><h2 class="block-title">Life expectancy at birth</h2>' +
      '<table class="data"><thead><tr><th>Group</th><th class="num">Years</th></tr></thead><tbody>' +
      "<tr><td>Both sexes</td><td class=\"num\">" + f.lifeExpectancy.both.toFixed(1) + "</td></tr>" +
      "<tr><td>Men</td><td class=\"num\">" + f.lifeExpectancy.men.toFixed(1) + "</td></tr>" +
      "<tr><td>Women</td><td class=\"num\">" + f.lifeExpectancy.women.toFixed(1) + "</td></tr>" +
      "</tbody></table></section>" +
      '<section class="block"><h2 class="block-title">Households</h2>' +
      '<div class="stat-grid">' +
      statCard({ value: "55.7M", label: "Households", note: "Private households" }) +
      statCard({ value: s.householdSize.toFixed(1), label: "Persons per household", note: "Average size" }) +
      statCard({ value: s.singlePersonHouseholdsPct.toFixed(1) + "%", label: "One-person households", note: "Share of all households" }) +
      statCard({ value: s.elderlySharePct.toFixed(1) + "%", label: "Population aged 65+", note: "Highest share among large countries" }) +
      "</div></section>" +
      '<section class="block"><h2 class="block-title">Education and health</h2>' +
      '<table class="data kv-table"><tbody>' +
      "<tr><td>Upper secondary enrollment</td><td>" + s.upperSecondaryEnrollmentPct + "% of the age group</td></tr>" +
      "<tr><td>Tertiary enrollment</td><td>" + s.tertiaryEnrollmentPct + "% of the age group</td></tr>" +
      "<tr><td>Infant mortality</td><td>" + s.infantMortalityPer1000.toFixed(1) + " per 1,000 live births</td></tr>" +
      "<tr><td>Physicians</td><td>" + s.physiciansPer1000.toFixed(1) + " per 1,000 people</td></tr>" +
      "</tbody></table>" +
      '<p class="block-note">Enrollment and health-system figures are the most recent published values from the sources named in the footer.</p></section>'
    );
  }
};

/* ---------- regions ---------- */

function prefectureRows(list) {
  return list.map(function (p, i) {
    const share = p.population / D.populationFacts.census2020Millions * 100;
    return "<tr><td class=\"num\">" + (i + 1) + "</td><td>" + esc(p.name) +
      "</td><td class=\"num\">" + p.population.toFixed(2) +
      "</td><td class=\"num\">" + share.toFixed(1) + "</td></tr>";
  }).join("");
}

const RegionsView = {
  html: function () {
    return (
      sectionHead("Regions", "Ten prefectures hold half the country",
        "The 2020 census counted 126.15 million people. The ten prefectures below account for 71.7 million of them. Click a column heading to sort.") +
      '<section class="block"><h2 class="block-title">Largest prefectures, 2020 census</h2>' +
      '<table class="data" id="pref-table"><thead><tr>' +
      '<th class="num sortable" data-key="rank">Rank <span class="arrow"></span></th>' +
      '<th class="sortable" data-key="name">Prefecture <span class="arrow"></span></th>' +
      '<th class="num sortable" data-key="population">Population (M) <span class="arrow"></span></th>' +
      '<th class="num sortable" data-key="share">Share (%) <span class="arrow"></span></th>' +
      "</tr></thead><tbody id=\"pref-body\">" +
      prefectureRows(D.prefectures) +
      "</tbody></table>" +
      '<p class="block-note">Population in millions; share of the 2020 census total.</p></section>' +
      '<section class="block"><h2 class="block-title">Greater Tokyo</h2>' +
      '<div class="hero"><div class="stat-grid" style="grid-template-columns:1fr 1fr">' +
      statCard({ value: "37.4M", label: "Greater Tokyo population", note: "Tokyo metropolis and surrounding prefectures" }) +
      statCard({ value: "14.05M", label: "Tokyo Metropolis itself", note: "2020 census" }) +
      "</div>" +
      '<p class="hero-sub">Nearly three in ten Japanese residents live in the Greater Tokyo area, the largest metropolitan economy in the world. The pull of the capital is the single strongest pattern in the regional data: Tokyo, Kanagawa, Saitama and Chiba all sit in the top seven prefectures.</p></div></section>'
    );
  },
  mount: function () {
    const body = document.getElementById("pref-body");
    const table = document.getElementById("pref-table");
    if (!body || !table) { return; }
    let key = "population";
    let dir = -1; // descending by population to start

    function sortedList() {
      const list = D.prefectures.slice();
      list.sort(function (a, b) {
        let va, vb;
        if (key === "name") { va = a.name; vb = b.name; }
        else if (key === "share" || key === "population") { va = a.population; vb = b.population; }
        else { va = D.prefectures.indexOf(a); vb = D.prefectures.indexOf(b); }
        if (va < vb) { return -1 * dir; }
        if (va > vb) { return 1 * dir; }
        return 0;
      });
      return list;
    }

    function render() {
      body.innerHTML = prefectureRows(sortedList());
      table.querySelectorAll("th.sortable").forEach(function (th) {
        const arrow = th.querySelector(".arrow");
        if (!arrow) { return; }
        arrow.textContent = th.getAttribute("data-key") === key
          ? (dir === 1 ? "\u25B2" : "\u25BC") : "";
      });
    }

    table.querySelectorAll("th.sortable").forEach(function (th) {
      th.addEventListener("click", function () {
        const k = th.getAttribute("data-key");
        if (k === key) { dir = dir * -1; }
        else { key = k; dir = k === "name" ? 1 : -1; }
        render();
      });
    });

    render();
  }
};

window.VIEWS = {
  overview: OverviewView,
  population: PopulationView,
  economy: EconomyView,
  society: SocietyView,
  regions: RegionsView
};
