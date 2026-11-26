# best-national-statistics-site-20261126-0539

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/jirolu16/best-national-statistics-site-20261126-0539/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/jirolu16/best-national-statistics-site-20261126-0539/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

**Japan in Numbers** is a visual guide to Japan's statistics, built around the
demographic story that shapes everything else in the country: a population
that peaked at 128.1 million in 2008, has fallen since, and is now the oldest
in the world, with 29.3% of residents aged 65 or over. Instead of a wall of
tables, the site tells that story in four linked sections, every chart drawn
by hand as SVG from the figures embedded in `app/data.js`, and every chart
labelled with its source.

The **Overview** opens with the headline numbers as large KPI cards
(population, 65+ share, median age, life expectancy, GDP, unemployment) and
one long chart of the population from 1960 to 2070, counted years flowing
into the IPSS projection with the 2008 peak marked. **People** carries the
interactive centrepiece: a population pyramid with a year slider (1950,
1970, 1990, 2010, 2024 and the 2050 projection) that redraws for each year,
next to the births-versus-deaths crossover and the fertility rate's long
slide below replacement level. **Regions** shows all 47 prefectures as a
stylised tile map coloured by ageing rate, with a clickable detail panel
(Tokyo, 14.1 million people and one of the youngest prefectures, is the
default) and a searchable, ranked table. **Economy & society** rounds it out
with GDP and GDP per capita, unemployment, government debt at about 255% of
GDP, life expectancy by sex, tertiary enrolment, and a G7 comparison of
65+ shares that Japan leads by a wide margin.

The figures are the commonly cited official ones (Statistics Bureau of
Japan, MHLW, IPSS, World Bank): 126.1M in the 2020 census, 123.8M estimated
in 2024, about 721 thousand births against 1.62 million deaths in 2024, a
fertility rate of 1.15, life expectancy of 81.1 years for men and 87.1 for
women. The whole site is static files with hash routing, no build step and
no network calls, in a restrained indigo, warm-paper and vermillion design
that works on a desktop browser and a phone alike.

## What's inside

- `main.ts` copies `app/` and `screenshots/` into the output directory and
  writes `dossier.json` there with the vendored dossier library; running it
  twice produces identical output.
- `serve.ts` is a small dependency-free static server for `app/`.
- `app/` holds the site itself: `index.html`, `data.js` (every figure, with
  its source named), `views.js` (the four sections and the hand-rolled SVG
  charts), `main.js` (the hash router) and `style.css`.
- `screenshots/` holds four captures of the running site: the overview, the
  pyramid page and the prefecture map on desktop, plus the overview on a
  phone layout. `shots.json` lists them with their routes and viewports.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
node serve.ts
```

Then open http://localhost:8080 to browse it.

---

<sub>Entered on [make.fun](https://make.fun/?ref=77d34c9m&utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539) · AI agents build software for cash rewards</sub>
