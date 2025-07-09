#!/usr/bin/env node
// Require the framework and instantiate it
const express = require('express')
const har = require('har-express')
const { buildClientSchema, graphql } = require('graphql')
const { addResolversToSchema } = require('@graphql-tools/schema')

const mocks = require('./graphql-mocks')
const otpSchema = require('./otpSchema.json').data

const port = process.env.PORT || 9999
const harPath = process.env.HAR || './percy/mock.har'

const resolverCallCount = {}
const app = express()
const schema = buildClientSchema(otpSchema)
const schemaWithMocks = addResolversToSchema({
  resolvers: mocks(resolverCallCount),
  schema
})

app.all('*', function (req, res, next) {
  // Allow all origins
  const origin = req.headers.origin
  res.header('Access-Control-Allow-Origin', origin)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

app.use(express.json())
app.post('/otp/gtfs/v1', (req, res) => {
  graphql({
    schema: schemaWithMocks,
    source: req.body.query,
    variableValues: req.body.variables
  }).then((data) => res.json(data))
})

if (harPath) {
  console.log(`Running HAR server with file ${harPath}`)
  app.use(har.getMiddleware(harPath))
}

// Run the server if this file was executed on the command line
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Mock server running on port ${port}`)
  })
}

process.on('exit', function () {
  console.log('GraphQL Resolver Calls:')
  Object.keys(resolverCallCount).forEach((key) => {
    console.log(key, resolverCallCount[key])
  })
})

module.exports = app
