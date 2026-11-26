// Japan in Numbers — the data layer.
//
// Every number on the site lives here, with its source named next to it.
// Headline figures are the commonly cited official readings (Statistics
// Bureau of Japan, MHLW, IPSS, World Bank). Longer series are smooth
// readings pinned to those anchors. Populations are in millions unless a
// series says otherwise.

// ------------------------------------------------------------ headline

export const HEADLINE = {
  pop2024: 123.8, // million people, 2024 estimate
  popCensus2020: 126.1, // million people, 2020 census
  popPeak: 128.1, // million people, 2008
  peakYear: 2008,
  share65plus: 29.3, // percent of residents aged 65+, 2024
  medianAge: 49, // years, about
  tfr2023: 1.2, // children per woman
  tfr2024: 1.15, // children per woman
  births2024: 721, // thousand, a record low
  deaths2024: 1618, // thousand
  lifeMen: 81.1, // years, 2023
  lifeWomen: 87.1, // years, 2023
  gdp2024: 4.0, // trillion USD, 2024
  unemployment2024: 2.5, // percent, 2024 average
  debtPctGdp: 255, // percent, gross government debt
  tertiary: 65, // percent, gross tertiary enrolment, about
  tokyoPop: 14.1, // million people, Tokyo prefecture
};

// ------------------------------------------------- population over time
// Millions. Counted/estimated through 2024, IPSS medium-fertility
// projection from 2025 onward.

export const POP_SERIES = [
  [1960, 94.3], [1965, 99.2], [1970, 104.7], [1975, 111.9], [1980, 117.1],
  [1985, 121.0], [1990, 123.6], [1995, 125.6], [2000, 126.9], [2005, 127.8],
  [2008, 128.1], [2010, 128.1], [2015, 127.1], [2020, 126.1], [2024, 123.8],
  [2030, 120.7], [2035, 116.6], [2040, 112.8], [2045, 108.8], [2050, 104.9],
  [2055, 101.0], [2060, 97.4], [2065, 94.2], [2070, 91.3],
];
export const PROJECTION_START = 2025;

// ------------------------------------------------------- births, deaths
// Thousands per year. Deaths overtook births in the mid-2000s.

export const VITAL = [
  // [year, births (k), deaths (k)]
  [1970, 1934, 713], [1975, 1901, 700], [1980, 1577, 722], [1985, 1432, 752],
  [1990, 1222, 820], [1995, 1187, 922], [2000, 1191, 962], [2005, 1063, 1084],
  [2010, 1071, 1197], [2015, 1006, 1290], [2020, 841, 1372], [2021, 811, 1439],
  [2022, 771, 1569], [2023, 727, 1576], [2024, 721, 1618],
];

// -------------------------------------------------------------- fertility
// Total fertility rate, children per woman.

export const FERTILITY = [
  [1960, 2.0], [1970, 2.13], [1975, 1.91], [1980, 1.75], [1985, 1.76],
  [1990, 1.54], [1995, 1.42], [2000, 1.36], [2005, 1.26], [2010, 1.39],
  [2015, 1.45], [2020, 1.33], [2023, 1.2], [2024, 1.15],
];

// --------------------------------------------------------- age pyramids
// Share of the total population in percent, by five-year age band and sex.
// Youngest band first (0–4) through 80+. 2050 is the IPSS projection.

export const AGE_BANDS = [
  '0–4', '5–9', '10–14', '15–19', '20–24', '25–29', '30–34', '35–39',
  '40–44', '45–49', '50–54', '55–59', '60–64', '65–69', '70–74', '75–79', '80+',
];

export const PYRAMID_YEARS = [1950, 1970, 1990, 2010, 2024, 2050];

// [men, women] percent pairs. Each year's pairs add to about 100; the
// 65+ totals follow the official readings (about 4.9% in 1950, 29.3% in
// 2024), and the 2050 shape follows the IPSS projection.
export const PYRAMIDS = {
  1950: [
    [6.7, 6.4], [6.3, 6.0], [5.7, 5.5], [5.1, 4.9], [4.5, 4.4], [3.9, 3.8],
    [3.4, 3.3], [3.0, 3.0], [2.6, 2.6], [2.2, 2.3], [1.9, 1.9], [1.6, 1.6],
    [1.3, 1.3], [0.9, 1.0], [0.6, 0.8], [0.4, 0.5], [0.2, 0.4],
  ],
  1970: [
    [4.3, 4.1], [4.5, 4.2], [4.2, 3.9], [4.6, 4.5], [5.0, 4.9], [4.4, 4.3],
    [4.1, 4.0], [3.9, 3.8], [3.3, 3.4], [2.8, 2.8], [2.3, 2.3], [2.0, 2.0],
    [1.7, 1.7], [1.3, 1.4], [0.9, 1.2], [0.6, 0.7], [0.3, 0.6],
  ],
  1990: [
    [3.0, 2.8], [3.4, 3.2], [3.8, 3.6], [4.2, 3.9], [4.0, 4.0], [3.6, 3.5],
    [3.3, 3.3], [3.9, 3.9], [4.1, 4.0], [3.5, 3.5], [3.0, 3.1], [2.8, 2.9],
    [2.5, 2.6], [1.9, 2.1], [1.4, 1.6], [0.9, 1.1], [0.6, 0.9],
  ],
  2010: [
    [2.5, 2.3], [2.6, 2.4], [2.7, 2.5], [2.7, 2.7], [2.8, 2.8], [3.0, 2.9],
    [3.3, 3.4], [3.5, 3.5], [3.2, 3.3], [3.0, 3.0], [3.0, 3.0], [3.3, 3.5],
    [3.2, 3.5], [3.2, 3.5], [2.6, 3.2], [2.0, 2.6], [2.0, 3.4],
  ],
  2024: [
    [1.8, 1.7], [2.1, 1.9], [2.3, 2.2], [2.5, 2.3], [2.5, 2.5], [2.7, 2.6],
    [2.8, 2.7], [2.9, 2.8], [3.1, 3.1], [3.4, 3.5], [3.5, 3.7], [3.3, 3.4],
    [2.9, 3.1], [2.9, 3.1], [2.9, 3.5], [2.6, 3.3], [3.8, 6.4],
  ],
  2050: [
    [1.7, 1.6], [1.8, 1.7], [1.9, 1.8], [2.0, 1.9], [2.2, 2.1], [2.4, 2.3],
    [2.6, 2.5], [2.8, 2.7], [2.9, 2.8], [2.9, 3.0], [3.0, 3.1], [3.1, 3.2],
    [3.2, 3.4], [3.3, 3.6], [3.5, 4.1], [3.5, 4.4], [4.7, 7.9],
  ],
};

// ----------------------------------------------------------- prefectures
// Population in millions (2020 census, rounded) and the share of
// residents aged 65+ in percent (about 2023). gridCol/gridRow place the
// tile on the stylised map: columns grow east, rows grow south.

export const PREFECTURES = [
  // [name, population (M), 65+ share (%), gridCol, gridRow]
  ['Hokkaido', 5.22, 32.2, 9, 0],
  ['Aomori', 1.24, 33.9, 8, 1],
  ['Iwate', 1.21, 34.3, 9, 2],
  ['Akita', 0.96, 38.1, 8, 2],
  ['Miyagi', 2.30, 29.0, 9, 3],
  ['Yamagata', 1.07, 34.6, 8, 3],
  ['Fukushima', 1.83, 32.4, 9, 4],
  ['Niigata', 2.20, 33.6, 7, 4],
  ['Ibaraki', 2.87, 30.1, 9, 5],
  ['Tochigi', 1.93, 29.8, 8, 5],
  ['Gunma', 1.94, 30.6, 7, 5],
  ['Saitama', 7.34, 27.0, 8, 6],
  ['Chiba', 6.28, 27.9, 9, 7],
  ['Tokyo', 14.05, 23.5, 8, 7],
  ['Kanagawa', 9.24, 25.8, 8, 8],
  ['Toyama', 1.03, 33.4, 6, 4],
  ['Ishikawa', 1.13, 30.9, 5, 5],
  ['Fukui', 0.77, 31.7, 5, 6],
  ['Nagano', 2.05, 32.9, 7, 6],
  ['Yamanashi', 0.81, 31.4, 7, 7],
  ['Shizuoka', 3.63, 30.4, 7, 8],
  ['Gifu', 1.98, 31.2, 6, 6],
  ['Aichi', 7.54, 25.6, 6, 7],
  ['Mie', 1.77, 30.9, 5, 9],
  ['Shiga', 1.41, 26.4, 5, 7],
  ['Kyoto', 2.58, 29.9, 4, 7],
  ['Osaka', 8.84, 27.6, 4, 8],
  ['Hyogo', 5.47, 29.7, 3, 7],
  ['Nara', 1.32, 31.6, 4, 9],
  ['Wakayama', 0.92, 33.8, 4, 10],
  ['Tottori', 0.55, 33.3, 3, 6],
  ['Shimane', 0.67, 34.8, 2, 6],
  ['Okayama', 1.89, 31.0, 3, 8],
  ['Hiroshima', 2.80, 29.9, 2, 8],
  ['Yamaguchi', 1.34, 34.7, 1, 8],
  ['Kagawa', 0.95, 32.5, 3, 9],
  ['Tokushima', 0.72, 34.3, 4, 11],
  ['Ehime', 1.33, 33.5, 2, 9],
  ['Kochi', 0.69, 35.9, 3, 10],
  ['Fukuoka', 5.14, 28.3, 1, 9],
  ['Saga', 0.81, 30.9, 0, 9],
  ['Nagasaki', 1.31, 33.0, 0, 10],
  ['Kumamoto', 1.74, 31.6, 0, 11],
  ['Oita', 1.12, 33.4, 1, 10],
  ['Miyazaki', 1.07, 32.2, 1, 11],
  ['Kagoshima', 1.59, 32.3, 1, 12],
  ['Okinawa', 1.47, 23.0, 0, 14],
];

// -------------------------------------------------------------- economy

// GDP, trillion USD (World Bank).
export const GDP = [
  [1970, 0.21], [1980, 1.09], [1990, 3.20], [1995, 5.33], [2000, 4.97],
  [2005, 4.83], [2010, 5.76], [2015, 4.44], [2020, 5.05], [2022, 4.26],
  [2024, 4.03],
];

// GDP per capita, thousand USD (World Bank).
export const GDP_PER_CAPITA = [
  [1990, 25.9], [1995, 42.5], [2000, 39.2], [2005, 37.8], [2010, 45.0],
  [2015, 34.9], [2020, 40.1], [2022, 34.1], [2024, 32.5],
];

// Unemployment rate, percent of the labour force (Statistics Bureau).
export const UNEMPLOYMENT = [
  [1970, 1.1], [1980, 2.0], [1990, 2.1], [1995, 3.2], [2000, 4.7],
  [2005, 4.4], [2010, 5.1], [2015, 3.4], [2020, 2.8], [2024, 2.5],
];

// Gross government debt, percent of GDP (IMF).
export const GOV_DEBT = [
  [1990, 67], [2000, 135], [2010, 205], [2020, 258], [2024, 255],
];

// Life expectancy at birth, years, by sex (MHLW).
export const LIFE = [
  // [year, men, women]
  [1980, 73.4, 78.8], [1990, 75.9, 81.9], [2000, 77.7, 84.6],
  [2010, 79.6, 86.3], [2023, 81.1, 87.1],
];

// Share of residents aged 65+, percent, G7 comparison (about 2023–24).
export const G7_OLD = [
  ['Japan', 29.3], ['Italy', 24.5], ['Germany', 22.8], ['France', 21.7],
  ['United Kingdom', 19.0], ['Canada', 18.9], ['United States', 17.3],
];
