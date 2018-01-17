#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const repl = require('repl')
const hypergraph = require('hyper-graph-db')
const Transform = require('stream').Transform
const N3 = require('n3')

let graph

function evalLoop (cmd, context, filename, callback) {
  if (!graph) {
    callback(null, 'First you need to create or load a hyper-graph-db instance. Use .create [name]')
    return
  }
  if (cmd && cmd !== '\n' && !cmd.match(/\n\n$/)) {
    callback(new repl.Recoverable())
    return
  }
  console.log('-----')
  console.log(cmd)
  console.log('-----')
  const stream = graph.queryStream(cmd)
  stream.on('data', console.log)
  stream.on('end', () => callback(null))
  stream.on('error', callback)
}

const replServer = repl.start({prompt: '--> ', eval: evalLoop})

replServer.on('exit', () => {
  console.log('Received "exit" event from repl!')
  process.exit()
})

replServer.defineCommand('create', function (name) {
  console.log('creating', name)
  const exists = fs.existsSync(name)
  graph = hypergraph(name)
  graph.on('ready', (err) => {
    if (err) {
      console.log(err)
      return
    }
    if (exists) {
      console.log('Already existed, so opened hypergraph', name)
    } else {
      console.log('Created new hypergraph', name)
    }
    this.displayPrompt()
  })
})

function importTurtleFile (g, file, callback) {
  const parser = N3.StreamParser()
  const writer = g.putStream()
  // N3.Parser._resetBlankNodeIds()
  const logger = new Transform({
    objectMode: true,
    transform: function (data, encoding, done) {
      console.log(data)
      this.push(data)
      done()
    }
  })
  fs.createReadStream(file).pipe(parser).pipe(logger).pipe(writer)
  writer.on('end', callback)
  writer.on('error', callback)
}

replServer.defineCommand('import', function (file) {
  if (!graph) {
    console.log('must create or load hypergraph first')
    return
  }
  const filepath = path.resolve(__dirname, file)
  importTurtleFile(graph, filepath, (err) => {
    if (err) {
      console.log('could not import', file)
      console.log(err)
      this.displayPrompt()
      return
    }
    console.log('imported', file)
    this.displayPrompt()
  })
})

replServer.defineCommand('load', () => {
  console.log('Received "load" event from repl!')
})
