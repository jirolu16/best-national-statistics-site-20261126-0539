/*
 * Japan in Numbers - data layer.
 *
 * Every figure shown on the site lives in this file so the pages stay
 * declarative. The two objects below are deliberately written as plain
 * JSON-compatible literals: the build tool (main.ts) reads this file,
 * lifts the literals out, and counts what the site actually contains
 * when it writes the dossier. Keep keys double-quoted and do not put
 * brace characters inside string values.
 *
 * Sources: Statistics Bureau of Japan; e-Stat portal; World Bank.
 */
"use strict";

const SITE_META = {
  "title": "Japan in Numbers",
  "country": "Japan",
  "tagline": "The official-statistics portrait of Japan, in one static site.",
  "language": "en",
  "sections": ["overview", "population", "economy", "society", "regions"],
  "sources": ["Statistics Bureau of Japan", "e-Stat", "World Bank"],
  "indicators": [
    { "id": "population-2024", "label": "Population (2024)", "value": "123.8M", "note": "Estimate, Statistics Bureau" },
    { "id": "gdp-2023", "label": "GDP (2023)", "value": "4.21T USD", "note": "World Bank, current prices" },
    { "id": "median-age", "label": "Median age", "value": "49.9", "note": "Years, national estimate" },
    { "id": "life-expectancy", "label": "Life expectancy", "value": "84.0", "note": "Years at birth, both sexes" },
    { "id": "fertility-2023", "label": "Fertility rate (2023)", "value": "1.20", "note": "Children per woman" },
    { "id": "unemployment", "label": "Unemployment", "value": "2.5%", "note": "Labour Force Survey average" },
    { "id": "households", "label": "Households", "value": "55.7M", "note": "Private households, census basis" },
    { "id": "forest-share", "label": "Forest share of land", "value": "67%", "note": "Share of national land area" }
  ]
};

const JAPAN_DATA = {
  "populationSeries": [
    [1960, 94.3], [1970, 104.7], [1980, 117.1], [1990, 123.6],
    [2000, 126.9], [2008, 128.1], [2010, 128.1], [2015, 127.1],
    [2020, 126.1], [2024, 123.8]
  ],
  "gdpSeries": [
    [2000, 4.97], [2005, 4.83], [2010, 5.76], [2012, 6.27],
    [2015, 4.44], [2019, 5.12], [2020, 5.05], [2021, 5.03],
    [2022, 4.26], [2023, 4.21]
  ],
  "trade2023": { "exportsBn": 785, "importsBn": 786 },
  "ageShares": {
    "1990": { "young": 18.2, "working": 69.7, "elderly": 12.1 },
    "2024": { "young": 11.4, "working": 59.6, "elderly": 29.0 }
  },
  "populationFacts": {
    "census2020Millions": 126.15,
    "medianAge": 49.9,
    "fertility2023": 1.20,
    "lifeExpectancy": { "both": 84.0, "men": 81.1, "women": 87.1 }
  },
  "economyFacts": {
    "gdpPerCapitaUsd": 33800,
    "unemploymentPct": 2.5,
    "labourForceMillions": 69.5
  },
  "glanceFacts": [
    { "label": "Capital", "value": "Tokyo" },
    { "label": "Land area", "value": "377,975 km2" },
    { "label": "Households", "value": "55.7M" },
    { "label": "Fertility rate", "value": "1.20" },
    { "label": "Unemployment", "value": "2.5%" },
    { "label": "Forest share", "value": "67%" }
  ],
  "society": {
    "householdSize": 2.2,
    "elderlySharePct": 29.0,
    "singlePersonHouseholdsPct": 38.1,
    "tertiaryEnrollmentPct": 59,
    "upperSecondaryEnrollmentPct": 99,
    "infantMortalityPer1000": 1.8,
    "physiciansPer1000": 2.6
  },
  "prefectures": [
    { "name": "Tokyo", "population": 14.05 },
    { "name": "Kanagawa", "population": 9.24 },
    { "name": "Osaka", "population": 8.84 },
    { "name": "Aichi", "population": 7.54 },
    { "name": "Saitama", "population": 7.34 },
    { "name": "Chiba", "population": 6.28 },
    { "name": "Hyogo", "population": 5.47 },
    { "name": "Hokkaido", "population": 5.22 },
    { "name": "Fukuoka", "population": 5.14 },
    { "name": "Kyoto", "population": 2.58 }
  ],
  "greaterTokyoMillions": 37.4
};

window.SITE_META = SITE_META;
window.JAPAN_DATA = JAPAN_DATA;
