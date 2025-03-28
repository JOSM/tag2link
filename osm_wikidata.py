#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from gzip import decompress

from rdflib import Graph, URIRef, Literal, Namespace
from requests import get

g = Graph()
if os.path.isfile("wikibase-rdf.ttl"):
    print("Parsing local file")
    g.parse("wikibase-rdf.ttl", format="turtle")
else:
    print("Parsing remote file")
    osm_wikibase = decompress(
        get("https://wiki.openstreetmap.org/dump/wikibase-rdf.ttl.gz").content
    )
    g.parse(osm_wikibase, format="turtle")

wikibase = Namespace("http://wikiba.se/ontology#")
wd = Namespace("//wiki.openstreetmap.org/entity/")
wdt = Namespace("//wiki.openstreetmap.org/prop/direct/")
p = Namespace("//wiki.openstreetmap.org/prop/")
ps = Namespace("//wiki.openstreetmap.org/prop/statement/")

g.bind("wikibase", wikibase)
g.bind("wd", wd)
g.bind("wdt", wdt)
g.bind("p", p)
g.bind("ps", ps)

with open("tag2link.dataitem.sparql", "r", encoding="UTF-8") as query_sparql:
    query = query_sparql.read()
results = []
for result in g.query(query):
    d = result.asdict()
    for k in d:
        v = d[k]
        if isinstance(v, Literal):
            d[k] = v.value
        elif isinstance(v, URIRef):
            d[k] = v.toPython()
        else:
            raise Exception("Unknown type: " + str(type(v)))
    results.append(d)

with open("wikidata.json", "w") as wikidata:
    json.dump(results, wikidata)
