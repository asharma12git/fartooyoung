# Plan 13: Interactive Child Marriage Global Map

## Overview
An interactive choropleth map showing child marriage prevalence by country. Users hover/click to see statistics (% married before 18, % before 15). Provides a powerful visual for advocacy, presentations, and donor engagement.

**Status:** 📋 Planned
**Priority:** Medium
**Cost:** $0/month (static data, client-side rendering)
**Effort:** 6-8 hours
**Dependencies:** None

## Prerequisites
- UNICEF dataset downloaded and processed into JSON
- React map library installed (`react-simple-maps`)
- GeoJSON world map topology file

## Cost

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| react-simple-maps | Client-side rendering | $0 |
| UNICEF data | Public domain (CC BY 3.0) | $0 |
| TopoJSON | Open source map data | $0 |
| **Total** | | **$0/month** |

## Data Sources (Verified Available)

### Primary: UNICEF Child Marriage Dataset
- **URL:** https://data.unicef.org/resources/dataset/child-marriage/
- **Download:** https://data.unicef.org/wp-content/uploads/2019/10/XLS_Child-marriage-database_Apr-2025.xlsx
- **Format:** Excel (.xlsx), downloadable, machine-readable
- **License:** Creative Commons Attribution 3.0 IGO (free to use with attribution)
- **Coverage:** 235 countries
- **Last updated:** April 2025
- **Indicators available:**
  - % of women aged 20-24 married before age 15
  - % of women aged 20-24 married before age 18
  - % of men aged 20-24 married before age 18
  - % of women aged 15-19 currently married
- **Query builder:** https://data.unicef.org/resources/data_explorer/unicef_f/?ag=UNICEF&df=GLOBAL_DATAFLOW

### Secondary: Child Marriage Data Portal (Girls Not Brides / UNICEF)
- **URL:** https://childmarriagedata.org/
- **Coverage:** Country profiles with trends, regional data
- **Use:** Cross-reference and additional context

### Tertiary: World Bank Open Data
- **URL:** https://data.worldbank.org/indicator/SP.M18.2024.FE.ZS
- **Format:** CSV/JSON API
- **Use:** Alternative source, same underlying UNICEF data

## Checklist

### Phase 1: Data Preparation
- [ ] Step 1: Download UNICEF Excel dataset
- [ ] Step 2: Parse and convert to JSON (country ISO code → prevalence %)
- [ ] Step 3: Store as static JSON in `src/data/child-marriage-data.json`

### Phase 2: Map Implementation
- [ ] Step 4: Install react-simple-maps + topojson
- [ ] Step 5: Build interactive choropleth map component
- [ ] Step 6: Add to site as new page or section

### Phase 3: Enhancement
- [ ] Step 7: Add tooltips, click-to-detail, legend
- [ ] Step 8: Mobile responsive adjustments

---

## Step 1: Download & Parse UNICEF Data

**Benefit:** Machine-readable country-level child marriage data for 235 countries, directly from the authoritative source.

**Implementation:**
- Download the April 2025 Excel file
- Extract columns: ISO country code, country name, % married before 18, % married before 15
- Convert to JSON format:
```json
{
  "NER": { "country": "Niger", "before18": 76, "before15": 28 },
  "CAF": { "country": "Central African Republic", "before18": 52, "before15": 17 },
  "CHD": { "country": "Chad", "before18": 61, "before15": 24 },
  ...
}
```
- Store in `src/data/child-marriage-data.json` (~15KB)

## Step 5: Build Interactive Map Component

**Benefit:** Visual, engaging way to show the global scale of child marriage. More impactful than text statistics.

**Implementation:**
- Library: `react-simple-maps` (lightweight, SVG-based, no API keys needed)
- Map type: Choropleth (countries colored by severity)
- Color scale: Green (0-10%) → Yellow (10-30%) → Orange (30-50%) → Red (50%+)
- Interactions:
  - Hover: show tooltip with country name + percentage
  - Click: expand panel with details (before 15 vs before 18, trend data)
- Legend: color gradient bar at bottom
- Data label: "Source: UNICEF, April 2025"

### Color Scale
| Range | Color | Label |
|-------|-------|-------|
| 0-10% | Green | Low |
| 10-25% | Yellow | Moderate |
| 25-40% | Orange | High |
| 40%+ | Red | Very High |
| No data | Grey | No data |

### Tech Stack
- `react-simple-maps` — renders SVG world map
- `d3-scale` — color scaling
- `topojson-client` — efficient map geometry
- No backend needed — all client-side

## Step 6: Page Integration

**Options:**
1. **Dedicated page** at `/map` — "Global Map" nav link
2. **Section on home page** — below the hero, above the donate CTA
3. **Section on "What We Do"** — as evidence of global scope

Recommendation: Option 1 (dedicated page) for SEO + Ad Grants landing page.

---

## Example Sites Using Similar Maps
- https://childmarriagedata.org/ (Girls Not Brides — same data, their own map)
- https://data.unicef.org/topic/child-protection/child-marriage/ (UNICEF's version)

## Attribution Requirement
Per Creative Commons BY 3.0 IGO license, must include:
> "Data source: UNICEF global databases, based on DHS, MICS and other nationally representative surveys."

---

*Last updated: June 6, 2026*
