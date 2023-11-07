// Require the framework and instantiate it
const express = require('express')
const har = require('har-express')
const { buildClientSchema, graphql } = require('graphql')
const { addResolversToSchema } = require('@graphql-tools/schema')

const mocks = require('./graphql-mocks')
const otpSchema = require('./otpSchema.json').data

const port = process.env.PORT || 9999
const harPath = process.env.HAR

const app = express()
const schema = buildClientSchema(otpSchema)
const schemaWithMocks = addResolversToSchema({ resolvers: mocks, schema })

app.use(express.json())
app.post('/otp2/routers/default/index/graphql', (req, res) => {
  console.log('Handling GraphQL Mock')
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

app.listen(port, () => {
  console.log('Mock server running.')
})
