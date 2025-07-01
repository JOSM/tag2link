export interface Tag2Link {
  /** OSM tag key */
  key: `Key:${string}`;
  /** URL template or formatter URL: replace `$1` with the tag value */
  url: string;
  /** Source of this formatter URL */
  source: `${'wikidata' | 'osm'}:P${number}`;
  /** Rank or relative importance of this formatter URL */
  rank: 'preferred' | 'normal' | 'deprecated';
}

declare const exports: Tag2Link[];

export default exports;
