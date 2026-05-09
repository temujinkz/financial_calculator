# Financial Calculator

A small suite of business‑day and interest calculators built for a multilateral bank's operations team. Three tools sit behind a single dashboard:

- **Disbursement Date** — calculate disbursement dates from a starting date, accounting for business days across multiple country calendars and holiday logic.
- **Starting Date** — work backwards to determine the latest starting date that still hits a target disbursement deadline.
- **Interest** — interest computation for the same calendar logic.

## Design

- Inter type, dark dashboard with card grid
- One landing page (`index.html`) routes to three sub‑apps in their own folders
- Vanilla JS — no framework, no build step

## Stack

Plain HTML, CSS, JavaScript. Open `index.html` to use.

## Structure

```
index.html        dashboard with three tool cards
styles.css        shared dashboard styles
script.js         shared helpers
disbursement/     disbursement date calculator
starting/         starting date calculator
interest/         interest calculator
```

## Why custom

Off‑the‑shelf business‑day libraries don't carry the right country calendars or holiday tables for the institution's operating regions, so the logic is implemented locally and kept auditable.
