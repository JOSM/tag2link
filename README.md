# Tag2Link

This repository contains formatter URLs for OpenStreetMap keys. The data is obtained from:

- Wikidata items which have [OSM tag or key (P1282)](https://www.wikidata.org/wiki/Property:P1282) and [formatter URL (P1630)](https://www.wikidata.org/wiki/Property:P1630) defined
- OSM Wiki Wikibase via the OSM Sophox Service which have [formatter URL (P8)](https://wiki.openstreetmap.org/wiki/Property:P8)

## Contributing
### OSM Wiki Data
1. Read [https://wiki.openstreetmap.org/wiki/Data\_items](https://wiki.openstreetmap.org/wiki/Data_items).
2. Create the item (see [https://wiki.openstreetmap.org/wiki/Data\_items#Item\_creation\_process](https://wiki.openstreetmap.org/wiki/Data_items#Item_creation_process)).
3. Input the standard information for the tag. Be as complete as possible please. Other software may use this information (such as for validation purposes).
4. Add the `formatter url` (`P8`) property.
5. Don't forget to add the [site link](https://wiki.openstreetmap.org/wiki/Special:SetSiteLink) (see #2 for details).
6. Wait for the next update

Example: [https://wiki.openstreetmap.org/wiki/Item:Q401](https://wiki.openstreetmap.org/wiki/Item:Q401)

## Usage

Use `index.json` in your application. Replace `$1` with the tag value.

You may want to obtain the package from npm: https://www.npmjs.com/package/tag2link

## Updating

Run `npm build` which will update `index.json`.

## Taginfo

The extracted keys and URLs are also provided in Taginfo: https://taginfo.openstreetmap.org/projects/tag2link#tags
