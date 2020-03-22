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
  url: i.formatter_URL.value
}));

console.log(`Writing ${data.length} rules to index.json`);
fs.writeFileSync("index.json", JSON.stringify(data, undefined, 2));

const package = JSON.parse(fs.readFileSync("package.json"));
package.version = new Date()
  .toISOString()
  .substring(0, 10)
  .replace(/-/g, ".");
console.log(`Updating package version to ${package.version}`);
fs.writeFileSync("package.json", JSON.stringify(package, undefined, 2));

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
