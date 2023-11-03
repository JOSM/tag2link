#!/usr/bin/env node
import { isDeepStrictEqual } from "util";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { execFileSync } from "child_process";

interface SparkQLBinding {
  type: string;
  value: string;
}

interface SparkQL {
  head: Array<string>; // We don't actually use this, but it gives us the keys for the bindings
  results: {
    bindings: Array<{
      OSM_key: SparkQLBinding;
      formatter_URL: SparkQLBinding;
      rank: SparkQLBinding;
      source: SparkQLBinding;
    }>;
  };
}

interface PackageJson {
  author: string;
  name: string;
  description: string;
  homepage: string;
  contact_name: string;
  contact_email: string;
}

interface IndexData {
  key: string;
  url: string;
  source: string;
  rank: string;
}

async function parse_osm_wikidata(): Promise<SparkQL> {
  const text = readFileSync("wikidata.json", "utf8");
  const osm_wikidata = JSON.parse(text);
  const bindings = osm_wikidata.map((x) =>
    Object.fromEntries(Object.entries(x).map(([k, v]) => [k, { value: v }])),
  );
  return { head: [], results: { bindings: bindings } };
}

async function writeWikidataSophoxRules(): Promise<
  [Array<IndexData>, boolean]
> {
  const osm_wikidata = await parse_osm_wikidata();
  const fromWikidata = await sparql(
    "https://query.wikidata.org/sparql",
    "tag2link.wikidata.sparql",
  );
  // we used to have sparql("https://sophox.org/sparql", "tag2link.sophox.sparql"), but that was extremely outdated

  const data = [
    ...fromWikidata.results.bindings,
    ...osm_wikidata.results.bindings,
  ].map(
    (i) =>
      ({
        key: i.OSM_key.value,
        url: i.formatter_URL.value,
        source: i.source.value,
        rank: {
          "http://wikiba.se/ontology#PreferredRank": "preferred",
          "http://wikiba.se/ontology#NormalRank": "normal",
          "http://wikiba.se/ontology#DeprecatedRank": "deprecated",
        }[i.rank.value],
      }) as IndexData,
  );

  data.sort((link1, link2) => {
    const comparators = [
      (x) => x.key,
      (x) =>
        ({
          preferred: "1",
          normal: "2",
          deprecated: "3",
        })[x.rank] || "9",
      (x) => x.url,
      (x) => x.source,
    ];
    return (
      comparators
        .map((cmp) => cmp(link1).localeCompare(cmp(link2)))
        .find((i) => i !== 0) || 0
    );
  });
  const original = existsSync("index.json")
    ? JSON.parse(readFileSync("index.json").toString())
    : {};
  const changed = !isDeepStrictEqual(original, data);
  if (changed) {
    console.log(`Writing ${data.length} rules to index.json`);
    writeFileSync("index.json", JSON.stringify(data, undefined, 2));
  } else {
    console.log(`index.json did not need to be updated`);
  }
  return [data, changed];
}

function updatePackageVersion(now: Date): PackageJson {
  const packageJson = JSON.parse(readFileSync("package.json").toString());
  packageJson.version = now.toISOString().substring(0, 10).replace(/-/g, ".");
  console.log(`Updating package version to ${packageJson.version}`);
  writeFileSync("package.json", JSON.stringify(packageJson, undefined, 2));
  return packageJson;
}

function updateTag2Link(
  tag2linkPackage: PackageJson,
  data: Array<IndexData>,
  now: Date,
): void {
  const packageAuthor = tag2linkPackage.author.match(/(.*) <(.*)>/);
  if (packageAuthor == null) {
    throw TypeError("Author could not be parsed: " + tag2linkPackage.author);
  }
  const taginfo = {
    data_format: 1,
    data_updated: now.toISOString().replace(/-|:|\.\d{3}/g, ""),
    project: {
      name: tag2linkPackage.name,
      description: tag2linkPackage.description,
      project_url: tag2linkPackage.homepage,
      contact_name: packageAuthor[1],
      contact_email: packageAuthor[2],
    },
    tags: data.map(({ key, url }) => ({
      key: key.replace(/^Key:/, ""),
      description: url,
    })),
  };
  console.log(`Updating taginfo.json`);
  writeFileSync("taginfo.json", JSON.stringify(taginfo, undefined, 2));
}

async function main(): Promise<void> {
  const [data, indexChanged] = await writeWikidataSophoxRules();

  if (indexChanged) {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const tag2linkPackage = updatePackageVersion(now);
    updateTag2Link(tag2linkPackage, data, now);
  }
}

async function sparql(url: string, filename: string): Promise<SparkQL> {
  return JSON.parse(
    curl(
      "--request",
      "POST",
      "--header",
      "Accept:application/json",
      "--data-urlencode",
      "query@" + filename,
      url,
    ),
  );
}

function curl(...args: string[]): string {
  return execFileSync("curl", ["--silent", ...args]).toString();
}

main().catch((error) => console.log(error));
