const path = require('path')

const express = require('express')

const PLAN_REALTIME = require('./mocks/plan.json')
const STOPS_FIRST = require('./mocks/stops.json')
const PARK_AND_RIDE = require('./mocks/pr.json')
const ROUTES = require('./mocks/routes.json')
const STOP_VIEWER_STOPTIMES = require('./mocks/stopviewer/stoptimes.json')
const STOP_VIEWER_STOP = require('./mocks/stopviewer/stop.json')
const STOP_VIEWER_ROUTES = require('./mocks/stopviewer/routes.json')

const app = express()

app.get('*', express.static(path.join(__dirname, '../dist')))

// Mock exactly the requests the test link will create requests to
app.get('/gtfs/v1', (req, res) => {
  res.send(PLAN_REALTIME)
})
app.get('/otp/routers/default/index/stops', (req, res) => {
  res.send(STOPS_FIRST)
})
app.get('/otp/routers/default/park_and_ride', (req, res) => {
  res.send(PARK_AND_RIDE)
})
app.get('/otp/routers/default/index/stops/Agency', (req, res) => {
  res.send(STOP_VIEWER_STOP)
})
app.get('/otp/routers/default/index/stops/Agency/routes', (req, res) => {
  res.send(STOP_VIEWER_ROUTES)
})
app.get('/otp/routers/default/index/stops/Agency/stoptimes', (req, res) => {
  res.send(STOP_VIEWER_STOPTIMES)
})
app.get('/otp/routers/default/index/routes', (req, res) => {
  res.send(ROUTES)
})
module.exports.mockServer = app
