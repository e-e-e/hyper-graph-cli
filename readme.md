# hyper-graph-cli

A simple cli tool for making, loading, importing data into, and querying [hyper-graph-db](https://github.com/e-e-e/hyper-graph-db) instances.

**This is very much a work in progress**

## Installation

```sh
npm install hyper-graph-cli -g
```

## Usage
```sh
# start up interactive REPL
hypergraph
# then create or load database
--> .create test.db
# then import data
--> .import path/to/triples.ttl
# then query directly with SPARQL
--> SELECT *
... WHERE {
...    ?s ?p ?o
... } LIMIT 10
# Watch the data flow.
--> .exit
```

