const express = require('express')

const PLAN_REALTIME = require('./mocks/plan.json')
const STOPS_FIRST = require('./mocks/stops.json')
const PARK_AND_RIDE = require('./mocks/pr.json')

const app = express()
// Mock exactly the requests the test link will create requests to
app.get('/otp/routers/default/plan', (req, res) => {
  res.send(PLAN_REALTIME)
})
app.get('/otp/routers/default/index/stops', (req, res) => {
  res.send(STOPS_FIRST)
})
app.get('/otp/routers/default/park_and_ride', (req, res) => {
  res.send(PARK_AND_RIDE)
})
module.exports.mockServer = app
