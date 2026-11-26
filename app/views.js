// Japan in Numbers — the four sections and their hand-rolled SVG charts.
//
// No chart library and no external assets: every chart is an SVG string
// built from the figures in data.js. Points and bars carry a data-tip
// attribute, and the shared tooltip (bindTooltips) shows it on hover/tap.

import {
  AGE_BANDS, FERTILITY, G7_OLD, GDP, GDP_PER_CAPITA, GOV_DEBT, HEADLINE,
  LIFE, POP_SERIES, PREFECTURES, PROJECTION_START, PYRAMID_YEARS, PYRAMIDS,
  UNEMPLOYMENT, VITAL,
} from './data.js';

const INDIGO = '#26355e';
const VERMILION = '#bc002d';
const GREYBLUE = '#7a86a8';
const GRIDLINE = '#ddd6c6';

// -------------------------------------------------------------- helpers

const fmt = (n, d = 1) =>
  n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const src = (text) => `<p class="source">Source: ${text}</p>`;

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// --------------------------------------------------------- SVG line chart
// lines: [{ pts: [[x, y], ...], color, label, dash?, width? }]
// opt: { yMin, yMax, ticks, yUnit, fmtY, fmtX, shadeFrom, shadeLabel,
//        ref: { y, label }, peaks: [{ x, y, label }] }

function svgLine(lines, opt = {}) {
  const W = 720, H = 300;
  const m = { l: 54, r: 18, t: 18, b: 32 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const all = lines.flatMap((l) => l.pts);
  const x0 = Math.min(...all.map((p) => p[0]));
  const x1 = Math.max(...all.map((p) => p[0]));
  const y0 = opt.yMin ?? Math.min(...all.map((p) => p[1]));
  const y1 = opt.yMax ?? Math.max(...all.map((p) => p[1]));
  const X = (x) => m.l + ((x - x0) / (x1 - x0)) * iw;
  const Y = (y) => m.t + ih - ((y - y0) / (y1 - y0)) * ih;
  const fy = opt.fmtY ?? ((v) => fmt(v, 0));
  const fx = opt.fmtX ?? ((v) => `${v}`);

  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;

  if (opt.shadeFrom !== undefined) {
    const sx = X(opt.shadeFrom);
    s += `<rect x="${sx.toFixed(1)}" y="${m.t}" width="${(m.l + iw - sx).toFixed(1)}" height="${ih}" fill="${VERMILION}" opacity="0.05"/>`;
    s += `<text x="${(sx + 6).toFixed(1)}" y="${m.t + 14}" class="svg-note">${opt.shadeLabel ?? 'projection'}</text>`;
  }

  const nTicks = opt.ticks ?? 5;
  for (let i = 0; i <= nTicks; i++) {
    const v = y0 + ((y1 - y0) * i) / nTicks;
    const y = Y(v);
    s += `<line x1="${m.l}" y1="${y.toFixed(1)}" x2="${m.l + iw}" y2="${y.toFixed(1)}" stroke="${GRIDLINE}"/>`;
    s += `<text x="${m.l - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="svg-tick">${fy(v)}</text>`;
  }

  const years = lines[0].pts.map((p) => p[0]);
  const step = Math.max(1, Math.round(years.length / 6));
  years.forEach((yr, i) => {
    if (i % step !== 0 && i !== years.length - 1) return;
    s += `<text x="${X(yr).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="svg-tick">${fx(yr)}</text>`;
  });
  if (opt.yUnit) {
    s += `<text x="${m.l + iw}" y="${m.t - 5}" text-anchor="end" class="svg-note">${opt.yUnit}</text>`;
  }

  if (opt.ref) {
    const y = Y(opt.ref.y);
    s += `<line x1="${m.l}" y1="${y.toFixed(1)}" x2="${m.l + iw}" y2="${y.toFixed(1)}" stroke="${GREYBLUE}" stroke-dasharray="5 4"/>`;
    s += `<text x="${m.l + iw - 4}" y="${(y - 6).toFixed(1)}" text-anchor="end" class="svg-note">${opt.ref.label}</text>`;
  }

  for (const line of lines) {
    const pts = line.pts.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ');
    s += `<polyline points="${pts}" fill="none" stroke="${line.color}" stroke-width="${line.width ?? 2.4}"${line.dash ? ` stroke-dasharray="${line.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const [x, y] of line.pts) {
      s += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="3" fill="${line.color}"/>`;
      s += `<circle class="hit" cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="11" fill="transparent" data-tip="${escAttr(`${line.label} · ${fx(x)}: ${fy(y)}`)}"/>`;
    }
  }

  for (const pk of opt.peaks ?? []) {
    s += `<circle cx="${X(pk.x).toFixed(1)}" cy="${Y(pk.y).toFixed(1)}" r="4.5" fill="${VERMILION}" stroke="#fff" stroke-width="1.5"/>`;
    s += `<text x="${X(pk.x).toFixed(1)}" y="${(Y(pk.y) - 12).toFixed(1)}" text-anchor="middle" class="svg-mark">${pk.label}</text>`;
  }

  return `${s}</svg>`;
}

function legendSwatches(items) {
  return `<div class="legend">${items.map((i) =>
    `<span class="legend-item"><span class="swatch" style="background:${i.color}"></span>${i.label}</span>`).join('')}</div>`;
}

// --------------------------------------------------------- SVG bar chart
// A small vertical bar chart for series with few points (e.g. debt).

function svgBars(points, opt = {}) {
  const W = 720, H = 260;
  const m = { l: 54, r: 18, t: 18, b: 32 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const yMax = opt.yMax ?? Math.max(...points.map((p) => p[1])) * 1.1;
  const fy = opt.fmtY ?? ((v) => fmt(v, 0));
  const bw = (iw / points.length) * 0.58;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
  for (let i = 0; i <= 4; i++) {
    const v = (yMax * i) / 4;
    const y = m.t + ih - (v / yMax) * ih;
    s += `<line x1="${m.l}" y1="${y.toFixed(1)}" x2="${m.l + iw}" y2="${y.toFixed(1)}" stroke="${GRIDLINE}"/>`;
    s += `<text x="${m.l - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="svg-tick">${fy(v)}</text>`;
  }
  points.forEach(([x, v], i) => {
    const cx = m.l + (iw * (i + 0.5)) / points.length;
    const h = (v / yMax) * ih;
    s += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${(m.t + ih - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${INDIGO}" data-tip="${escAttr(`${x}: ${fy(v)}`)}"/>`;
    s += `<text x="${cx.toFixed(1)}" y="${(m.t + ih - h - 6).toFixed(1)}" text-anchor="middle" class="svg-tick">${fy(v)}</text>`;
    s += `<text x="${cx.toFixed(1)}" y="${H - 8}" text-anchor="middle" class="svg-tick">${x}</text>`;
  });
  return `${s}</svg>`;
}

// -------------------------------------------------- horizontal bar board

function hBarBoard(rows, opt = {}) {
  const max = Math.max(...rows.map((r) => r[1]));
  const fy = opt.fmt ?? ((v) => fmt(v, 1));
  return `<div class="hbars">${rows.map(([label, v]) => {
    const hot = opt.hot === label;
    return `<div class="hbar${hot ? ' hot' : ''}" data-tip="${escAttr(`${label}: ${fy(v)}`)}">
      <span class="hbar-label">${label}</span>
      <span class="hbar-track"><span class="hbar-fill" style="width:${((v / max) * 100).toFixed(1)}%;background:${hot ? VERMILION : INDIGO}"></span></span>
      <span class="hbar-value">${fy(v)}</span></div>`;
  }).join('')}</div>`;
}

// ------------------------------------------------------------ the pyramid

function pyramidChart(year) {
  const rows = PYRAMIDS[year];
  const W = 720, rowH = 21, top = 28, H = top + rows.length * rowH + 8;
  const mid = W / 2, barMax = 300, valMax = 7;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
  s += `<text x="${mid - 12}" y="16" text-anchor="end" class="svg-head" fill="${INDIGO}">Men</text>`;
  s += `<text x="${mid + 12}" y="16" class="svg-head" fill="${VERMILION}">Women</text>`;
  rows.forEach(([men, women], i) => {
    const y = top + (rows.length - 1 - i) * rowH;
    const mw = (men / valMax) * barMax;
    const fw = (women / valMax) * barMax;
    s += `<rect x="${(mid - mw).toFixed(1)}" y="${y}" width="${mw.toFixed(1)}" height="${rowH - 4}" rx="2" fill="${INDIGO}" data-tip="${escAttr(`Age ${AGE_BANDS[i]} · men: ${fmt(men)}% of the population`)}"/>`;
    s += `<rect x="${mid}" y="${y}" width="${fw.toFixed(1)}" height="${rowH - 4}" rx="2" fill="${VERMILION}" data-tip="${escAttr(`Age ${AGE_BANDS[i]} · women: ${fmt(women)}% of the population`)}"/>`;
    s += `<text x="${mid}" y="${y + rowH - 8}" text-anchor="middle" class="svg-age">${AGE_BANDS[i]}</text>`;
  });
  return `${s}</svg>`;
}

function pyramidSummary(year) {
  const rows = PYRAMIDS[year];
  const old = rows.slice(13).reduce((a, [m, f]) => a + m + f, 0);
  const kids = rows.slice(0, 3).reduce((a, [m, f]) => a + m + f, 0);
  return { old, kids };
}

// ================================================================ views

function kpiCard(value, label, sub) {
  return `<div class="kpi"><div class="kpi-value">${value}</div><div class="kpi-label">${label}</div><div class="kpi-sub">${sub}</div></div>`;
}

export function overviewView() {
  const h = HEADLINE;
  const counted = POP_SERIES.filter((p) => p[0] < PROJECTION_START);
  const projected = POP_SERIES.filter((p) => p[0] >= 2024);
  const trend = svgLine(
    [
      { pts: counted, color: INDIGO, label: 'Population', width: 3 },
      { pts: projected, color: VERMILION, label: 'Population (projection)', dash: '7 5', width: 3 },
    ],
    {
      yMin: 80, yMax: 135, ticks: 5, yUnit: 'million people',
      fmtY: (v) => `${fmt(v, 0)}M`,
      shadeFrom: PROJECTION_START, shadeLabel: 'IPSS projection',
      peaks: [{ x: h.peakYear, y: h.popPeak, label: `Peak ${fmt(h.popPeak)}M · ${h.peakYear}` }],
    },
  );
  return `
  <section class="hero">
    <h2>A country of 124 million, growing older</h2>
    <p class="lede">Japan's population peaked in 2008 and has fallen every year since, while its
    share of older residents has climbed to the highest in the world. This site tells that story
    in the official numbers: how many people there are, how old they are, where they live, and
    what the economy looks like underneath.</p>
  </section>
  <section class="kpis">
    ${kpiCard(`${fmt(h.pop2024)}M`, 'Population, 2024', `2020 census: ${fmt(h.popCensus2020)}M`)}
    ${kpiCard(`${fmt(h.share65plus)}%`, 'Aged 65 and over', 'highest share in the world')}
    ${kpiCard(`about ${h.medianAge}`, 'Median age, years', 'half the country is older')}
    ${kpiCard(`${fmt(h.lifeWomen)} yrs`, 'Life expectancy, women', `men: ${fmt(h.lifeMen)} years (2023)`)}
    ${kpiCard(`$${fmt(h.gdp2024)}T`, 'GDP, 2024', '4th largest economy')}
    ${kpiCard(`${fmt(h.unemployment2024)}%`, 'Unemployment, 2024', 'average for the year')}
  </section>
  <section class="card">
    <h3>Population, 1960 to 2070</h3>
    ${trend}
    ${legendSwatches([{ color: INDIGO, label: 'Counted / estimated' }, { color: VERMILION, label: 'Projection' }])}
    ${src('Statistics Bureau of Japan; IPSS medium-fertility projection for 2025 onward')}
  </section>
  <section class="card prose">
    <h3>The story in one paragraph</h3>
    <p>Japan counted ${fmt(h.popCensus2020)} million people in its 2020 census, down from a
    peak of ${fmt(h.popPeak)} million in ${h.peakYear}. In 2024 about ${h.births2024.toLocaleString('en-US')} thousand
    babies were born, a record low, while about ${(h.deaths2024 / 1000).toFixed(2)} million people died: deaths now
    outnumber births by more than two to one. With a fertility rate of ${fmt(h.tfr2024, 2)} children per woman
    and ${fmt(h.share65plus)}% of residents aged 65 or over, the projections on this page show the population
    falling below 100 million in the late 2050s. The other sections unpack each part of that picture.</p>
  </section>`;
}

export function peopleView() {
  const crossover = svgLine(
    [
      { pts: VITAL.map((r) => [r[0], r[1]]), color: INDIGO, label: 'Births' },
      { pts: VITAL.map((r) => [r[0], r[2]]), color: VERMILION, label: 'Deaths' },
    ],
    { yMin: 0, yMax: 2100, ticks: 5, yUnit: 'thousand people a year', fmtY: (v) => `${fmt(v, 0)}k` },
  );
  const fertility = svgLine(
    [{ pts: FERTILITY, color: INDIGO, label: 'Fertility rate' }],
    {
      yMin: 0.8, yMax: 2.4, ticks: 4, yUnit: 'children per woman',
      fmtY: (v) => fmt(v, 2), ref: { y: 2.1, label: 'replacement level 2.1' },
    },
  );
  const year = 2024;
  const sum = pyramidSummary(year);
  return `
  <section class="hero">
    <h2>People: fewer births, longer lives</h2>
    <p class="lede">Drag the year slider and watch the pyramid change shape: a true pyramid in 1950,
    a beehive by 2024, and something closer to a column, top-heavy with older ages, by 2050.</p>
  </section>
  <section class="card">
    <h3>Population pyramid, <span id="pyr-year">${year}</span></h3>
    <div class="slider-row">
      <input type="range" id="pyr-slider" min="0" max="${PYRAMID_YEARS.length - 1}" step="1" value="${PYRAMID_YEARS.indexOf(year)}" aria-label="Pyramid year">
      <div class="slider-years">${PYRAMID_YEARS.map((y) => `<span>${y}${y === 2050 ? ' (proj.)' : ''}</span>`).join('')}</div>
    </div>
    <div id="pyr-wrap">${pyramidChart(year)}</div>
    <p class="pyr-stats" id="pyr-stats">In ${year}, about <strong>${fmt(sum.old)}%</strong> of Japan was
    aged 65 or over, and <strong>${fmt(sum.kids)}%</strong> was under 15.</p>
    ${src('Statistics Bureau of Japan censuses and estimates; IPSS projection for 2050. Shares of total population, five-year age groups')}
  </section>
  <section class="card">
    <h3>Births and deaths cross over</h3>
    ${crossover}
    ${legendSwatches([{ color: INDIGO, label: 'Births' }, { color: VERMILION, label: 'Deaths' }])}
    <p class="note">Deaths passed births in the mid-2000s. In 2024 the gap was about 897 thousand people,
    roughly the population of a mid-sized prefecture, lost in a single year.</p>
    ${src('MHLW vital statistics, 1970–2024')}
  </section>
  <section class="card">
    <h3>Fertility rate</h3>
    ${fertility}
    <p class="note">The total fertility rate fell below the replacement level of 2.1 in the mid-1970s and
    has never returned. It reached ${fmt(HEADLINE.tfr2024, 2)} in 2024, a record low.</p>
    ${src('MHLW / Statistics Bureau of Japan, 1960–2024')}
  </section>`;
}

// --------------------------------------------------------------- regions

const TILE_SHORT = {
  Hokkaido: 'Ho', Aomori: 'Ao', Iwate: 'Iw', Akita: 'Ak', Miyagi: 'Mi', Yamagata: 'Ya',
  Fukushima: 'Fu', Niigata: 'Ni', Ibaraki: 'Ib', Tochigi: 'To', Gunma: 'Gu', Saitama: 'Sa',
  Chiba: 'Ch', Tokyo: 'Tk', Kanagawa: 'Ka', Toyama: 'Ty', Ishikawa: 'Is', Fukui: 'Fi',
  Yamanashi: 'Yn', Nagano: 'Na', Shizuoka: 'Sz', Gifu: 'Gi', Aichi: 'Ai', Mie: 'Me',
  Shiga: 'Sh', Kyoto: 'Ky', Osaka: 'Os', Hyogo: 'Hy', Nara: 'Nr', Wakayama: 'Wa',
  Tottori: 'Tt', Shimane: 'Sm', Okayama: 'Ok', Hiroshima: 'Hi', Yamaguchi: 'Yc',
  Kagawa: 'Kg', Tokushima: 'Ts', Ehime: 'Eh', Kochi: 'Ko', Fukuoka: 'Fo', Saga: 'Sg',
  Nagasaki: 'Ng', Kumamoto: 'Ku', Oita: 'Oi', Miyazaki: 'Mz', Kagoshima: 'Ks', Okinawa: 'On',
};

function ageingShade(pct) {
  // Indigo (young) to vermillion (old), across the observed 23–38.1 range.
  const t = Math.min(1, Math.max(0, (pct - 23) / (38.1 - 23)));
  const young = [70, 90, 150], old = [188, 0, 45];
  const c = young.map((v, i) => Math.round(v + (old[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function tileMapSvg() {
  const size = 40, gap = 4, step = size + gap;
  const W = 10 * step + gap, H = 15 * step + gap;
  let s = `<svg class="chart tilemap" viewBox="0 0 ${W} ${H}" role="img">`;
  for (const [name, pop, old, col, row] of PREFECTURES) {
    const x = gap + col * step, y = gap + row * step;
    s += `<g class="tile" data-name="${name}" data-tip="${escAttr(`${name} · ${fmt(pop, 2)}M people · ${fmt(old)}% aged 65+`)}">
      <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="6" fill="${ageingShade(old)}"/>
      <text x="${x + size / 2}" y="${y + size / 2 + 4}" text-anchor="middle" class="svg-tile">${TILE_SHORT[name]}</text></g>`;
  }
  return `${s}</svg>`;
}

function prefDetailHtml(name) {
  const p = PREFECTURES.find((r) => r[0] === name) ?? PREFECTURES.find((r) => r[0] === 'Tokyo');
  const [n, pop, old] = p;
  const rank = [...PREFECTURES].sort((a, b) => b[1] - a[1]).findIndex((r) => r[0] === n) + 1;
  const oldCount = Math.round(pop * 1000 * (old / 100));
  const note = n === 'Tokyo'
    ? 'Tokyo is the largest prefecture by far and one of the youngest: its 65+ share of 23.5% sits far below the national 29.3%.'
    : old >= 34
      ? `${n} is among Japan's oldest prefectures: more than one resident in three is 65 or over, well above the national ${fmt(HEADLINE.share65plus)}%.`
      : `${n}'s 65+ share of ${fmt(old)}% compares with the national figure of ${fmt(HEADLINE.share65plus)}%.`;
  return `<h4>${n}</h4>
    <div class="detail-grid">
      <div><span class="detail-value">${fmt(pop, 2)}M</span><span class="detail-label">population (rank ${rank} of 47)</span></div>
      <div><span class="detail-value">${fmt(old)}%</span><span class="detail-label">aged 65 and over</span></div>
      <div><span class="detail-value">about ${oldCount.toLocaleString('en-US')}k</span><span class="detail-label">residents aged 65+</span></div>
    </div>
    <p class="note">${note}</p>`;
}

const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function prefTableRows(filter = '') {
  const q = filter.trim().toLowerCase();
  const rows = [...PREFECTURES]
    .sort((a, b) => b[1] - a[1])
    .filter((r) => r[0].toLowerCase().includes(q));
  if (rows.length === 0) {
    return `<tr><td colspan="4" class="empty">No prefecture matches “${escHtml(filter)}”.</td></tr>`;
  }
  return rows.map(([name, pop, old], i) => `<tr data-name="${name}" tabindex="0">
      <td>${i + 1}</td><td class="pref-name">${name}</td>
      <td>${fmt(pop, 2)}M</td>
      <td><span class="agebar"><span style="width:${((old / 40) * 100).toFixed(0)}%"></span></span>${fmt(old)}%</td></tr>`).join('');
}

export function regionsView() {
  return `
  <section class="hero">
    <h2>Regions: 47 prefectures, one young capital</h2>
    <p class="lede">Tokyo holds ${fmt(HEADLINE.tokyoPop)} million people, more than the nine smallest
    prefectures combined, and stays comparatively young because working-age people keep moving there.
    The map colours each prefecture by its share of residents aged 65+: indigo is younger, vermillion older.
    Tap a tile or a row to see its figures.</p>
  </section>
  <section class="card">
    <h3>Prefecture tile map</h3>
    <div class="map-wrap">${tileMapSvg()}</div>
    <div class="map-scale"><span>younger · 23% aged 65+</span><span class="scale-bar"></span><span>38% · older</span></div>
    ${src('Statistics Bureau of Japan, 2020 census populations; 65+ shares about 2023. Stylised tile map: one tile per prefecture, arranged by geography')}
  </section>
  <section class="card" id="pref-detail">${prefDetailHtml('Tokyo')}</section>
  <section class="card">
    <h3>All 47 prefectures</h3>
    <input type="search" id="pref-search" placeholder="Filter prefectures, e.g. tokyo or ky" aria-label="Filter prefectures">
    <div class="table-wrap"><table class="pref-table">
      <thead><tr><th>#</th><th>Prefecture</th><th>Population</th><th>Aged 65+</th></tr></thead>
      <tbody id="pref-rows">${prefTableRows()}</tbody>
    </table></div>
    ${src('Statistics Bureau of Japan, 2020 census; 65+ shares about 2023')}
  </section>`;
}

// --------------------------------------------------------------- economy

export function economyView() {
  const gdp = svgLine(
    [{ pts: GDP, color: INDIGO, label: 'GDP' }],
    { yMin: 0, yMax: 7, ticks: 5, yUnit: 'trillion USD', fmtY: (v) => `$${fmt(v, 0)}T` },
  );
  const gdpPc = svgLine(
    [{ pts: GDP_PER_CAPITA, color: INDIGO, label: 'GDP per capita' }],
    { yMin: 0, yMax: 50, ticks: 5, yUnit: 'thousand USD', fmtY: (v) => `$${fmt(v, 0)}k` },
  );
  const unemp = svgLine(
    [{ pts: UNEMPLOYMENT, color: INDIGO, label: 'Unemployment' }],
    { yMin: 0, yMax: 6, ticks: 5, yUnit: 'percent of the labour force', fmtY: (v) => `${fmt(v, 1)}%` },
  );
  const life = svgLine(
    [
      { pts: LIFE.map((r) => [r[0], r[1]]), color: INDIGO, label: 'Men' },
      { pts: LIFE.map((r) => [r[0], r[2]]), color: VERMILION, label: 'Women' },
    ],
    { yMin: 70, yMax: 90, ticks: 4, yUnit: 'years at birth', fmtY: (v) => `${fmt(v, 0)}` },
  );
  const debt = svgBars(GOV_DEBT, { yMax: 300, fmtY: (v) => `${fmt(v, 0)}%` });
  return `
  <section class="hero">
    <h2>Economy &amp; society: rich, employed, indebted, long-lived</h2>
    <p class="lede">Japan remains the world's fourth-largest economy at about $${fmt(HEADLINE.gdp2024)} trillion,
    with very low unemployment and the longest lives anywhere, alongside the heaviest public
    debt load of any advanced economy.</p>
  </section>
  <div class="two-col">
    <section class="card">
      <h3>GDP</h3>
      ${gdp}
      ${src('World Bank, current USD, 1970–2024')}
    </section>
    <section class="card">
      <h3>GDP per capita</h3>
      ${gdpPc}
      <p class="note">Per-capita GDP in dollar terms peaked in the 1990s–2010s and has slid with the yen:
      about $${fmt(32.5)}k in 2024.</p>
      ${src('World Bank, current USD, 1990–2024')}
    </section>
  </div>
  <div class="two-col">
    <section class="card">
      <h3>Unemployment</h3>
      ${unemp}
      <p class="note">Even in the worst post-bubble years unemployment barely passed 5%; it averaged
      ${fmt(HEADLINE.unemployment2024)}% in 2024.</p>
      ${src('Statistics Bureau of Japan labour force survey, 1970–2024')}
    </section>
    <section class="card">
      <h3>Government debt</h3>
      ${debt}
      <p class="note">Gross government debt stands at about ${HEADLINE.debtPctGdp}% of GDP, the highest
      among advanced economies, held mostly by domestic savers and the central bank.</p>
      ${src('IMF general government gross debt, percent of GDP')}
    </section>
  </div>
  <div class="two-col">
    <section class="card">
      <h3>Life expectancy by sex</h3>
      ${life}
      ${legendSwatches([{ color: INDIGO, label: 'Men' }, { color: VERMILION, label: 'Women' }])}
      ${src('MHLW abridged life tables, 1980–2023')}
    </section>
    <section class="card">
      <h3>Oldest countries: the G7 by 65+ share</h3>
      ${hBarBoard(G7_OLD, { hot: 'Japan', fmt: (v) => `${fmt(v)}%` })}
      <p class="note">Japan's lead is wide and growing. In education, about ${HEADLINE.tertiary}% of
      young Japanese adults are enrolled in tertiary education (university and junior college), among
      the higher rates in the OECD.</p>
      ${src('World Bank / national statistics, about 2023–24; MEXT for tertiary enrolment')}
    </section>
  </div>`;
}

// ================================================================ wiring

export function bindTooltips(root) {
  const tip = document.getElementById('tooltip');
  if (!tip) return;
  const show = (e) => {
    const t = e.target.closest('[data-tip]');
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t.getAttribute('data-tip');
    tip.hidden = false;
    const x = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const y = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    tip.style.left = `${Math.min(x + 14, window.innerWidth - 190)}px`;
    tip.style.top = `${y + 16}px`;
  };
  root.addEventListener('pointermove', show);
  root.addEventListener('pointerdown', show);
  root.addEventListener('pointerleave', () => { tip.hidden = true; }, true);
}

export function bindPeople(root) {
  const slider = root.querySelector('#pyr-slider');
  const wrap = root.querySelector('#pyr-wrap');
  const yearEl = root.querySelector('#pyr-year');
  const statsEl = root.querySelector('#pyr-stats');
  if (!slider || !wrap) return;
  slider.addEventListener('input', () => {
    const year = PYRAMID_YEARS[Number(slider.value)];
    wrap.innerHTML = pyramidChart(year);
    yearEl.textContent = `${year}${year === 2050 ? ' (projection)' : ''}`;
    const s = pyramidSummary(year);
    statsEl.innerHTML = `In ${year}, about <strong>${fmt(s.old)}%</strong> of Japan was
      aged 65 or over, and <strong>${fmt(s.kids)}%</strong> was under 15.`;
  });
}

export function bindRegions(root) {
  const detail = root.querySelector('#pref-detail');
  const pick = (name) => {
    detail.innerHTML = prefDetailHtml(name);
    root.querySelectorAll('.tile').forEach((t) => t.classList.toggle('selected', t.getAttribute('data-name') === name));
    root.querySelectorAll('#pref-rows tr').forEach((t) => t.classList.toggle('selected', t.getAttribute('data-name') === name));
  };
  root.querySelectorAll('.tile').forEach((t) =>
    t.addEventListener('click', () => pick(t.getAttribute('data-name'))));
  const rows = root.querySelector('#pref-rows');
  rows.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-name]');
    if (tr) pick(tr.getAttribute('data-name'));
  });
  rows.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const tr = e.target.closest('tr[data-name]');
    if (tr) pick(tr.getAttribute('data-name'));
  });
  const search = root.querySelector('#pref-search');
  search.addEventListener('input', () => { rows.innerHTML = prefTableRows(search.value); });
  pick('Tokyo');
}
