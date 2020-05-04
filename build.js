#!/usr/bin/env node
const child_process = require("child_process");
const fs = require("fs");

const fromWikidata = sparql(
  "https://query.wikidata.org/sparql",
  "tag2link.wikidata.sparql"
);
const fromSophox = sparql(
  "https://sophox.org/sparql",
  "tag2link.sophox.sparql"
);

const data = [
  ...fromWikidata.results.bindings,
  ...fromSophox.results.bindings
].map(i => ({
  key: i.OSM_key.value,
  url: i.formatter_URL.value,
  source: i.source.value,
  rank: {
    "http://wikiba.se/ontology#PreferredRank": "preferred",
    "http://wikiba.se/ontology#NormalRank": "normal",
    "http://wikiba.se/ontology#DeprecatedRank": "deprecated",
  }[i.rank.value],
}));

data.sort((link1, link2) => {
  const comparators = [
    (x) => x.key,
    (x) =>
      ({
        preferred: "1",
        normal: "2",
        deprecated: "3",
      }[x.rank] || "9"),
    (x) => x.url,
  ];
  return (
    comparators
      .map((cmp) => cmp(link1).localeCompare(cmp(link2)))
      .find((i) => i !== 0) || 0
  );
});

console.log(`Writing ${data.length} rules to index.json`);
fs.writeFileSync("index.json", JSON.stringify(data, undefined, 2));

const now = new Date();
now.setMinutes(0, 0, 0);
const package = JSON.parse(fs.readFileSync("package.json"));
package.version = now.toISOString().substring(0, 10).replace(/-/g, ".");
console.log(`Updating package version to ${package.version}`);
fs.writeFileSync("package.json", JSON.stringify(package, undefined, 2));

const author = package.author.match(/(.*) <(.*)>/);
const taginfo = {
  data_format: 1,
  data_updated: now.toISOString().replace(/-|:|\.\d{3}/g, ""),
  project: {
    name: package.name,
    description: package.description,
    project_url: package.homepage,
    contact_name: author[1],
    contact_email: author[2],
  },
  tags: data.map(({ key, url }) => ({
    key: key.replace(/^Key:/, ""),
    description: url,
  })),
};
console.log(`Updating taginfo.json`);
fs.writeFileSync("taginfo.json", JSON.stringify(taginfo, undefined, 2));

function sparql(url, filename) {
  return curl(
    "--request",
    "POST",
    "--header",
    "Accept:application/json",
    "--data-urlencode",
    "query@" + filename,
    url
  );
}

function curl() {
  const json = child_process.execFileSync("curl", ["--silent", ...arguments]);
  return JSON.parse(json);
}
