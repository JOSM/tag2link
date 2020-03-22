# Tag2Link

This repository contains formatter URLs for OpenStreetMap keys. The data is obtained from:

- Wikidata items which have [OSM tag or key (P1282)](https://www.wikidata.org/wiki/Property:P1282) and [formatter URL (P1630)](https://www.wikidata.org/wiki/Property:P1630) defined
- OSM Wiki Wikibase via the OSM Sophox Service which have [formatter URL (P8)](https://wiki.openstreetmap.org/wiki/Property:P8)

## Usage

Use `index.json` in your application. Replace `$1` with the tag value.

## Updating

Run `npm build` which will update `index.json`.
