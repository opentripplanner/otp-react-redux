const PlanResponseBike = require('./mocks/PlanResponseBike.json').data.plan
const PlanResponseWalk = require('./mocks/PlanResponseWalk.json').data.plan
const PlanResponseBusSubwayTram =
  require('./mocks/PlanResponseBusSubwayTram.json').data.plan
const TripResponse = require('./mocks/TripResponse.json').data.trip
const NearestResponse = require('./mocks/NearbyResponse.json').data.nearest
const Stop114900Response = require('./mocks/Stop114900Response.json').data.stop
const Stop803Response = require('./mocks/Stop803Response.json').data.stop
const Stop803ScheduleResponse = require('./mocks/Stop803ScheduleResponse.json')
  .data.stop
const StopsByRadiusResponse = require('./mocks/StopsByRadiusResponse.json').data
  .stopsByRadius
const ServiceTimeRangeResponse =
  require('./mocks/ServiceTimeRangeResponse.json').data.serviceTimeRange
const RoutesResponse = require('./mocks/Routes.json').data.routes
const IndividualRouteResponse = require('./mocks/IndividualRoute.json').data
  .route

function getPlanResponseMock(transportModes) {
  const transportModesString = transportModes
    .map((tm) => tm.mode)
    .sort()
    .join('')
  console.log(transportModesString)
  switch (transportModesString) {
    case 'BICYCLEBUSSUBWAYTRAM':
    case 'TRANSITWALK':
    case 'BUSSUBWAY':
      return PlanResponseBusSubwayTram
    case 'BICYCLE':
      return PlanResponseBike
    case 'WALK':
      return PlanResponseWalk
    default:
      return PlanResponseBike
  }
}

function getStopResponseMock(stopId, requestNumber) {
  switch (stopId) {
    case 'MARTA:803':
      switch (requestNumber) {
        case 3:
        case 7: // callCount does not reset between desktop and mobile tests.
          return Stop803ScheduleResponse
        default:
          return Stop803Response
      }
    case 'MARTA:114900':
    default:
      return Stop114900Response
  }
}

const increment = (obj, key) =>
  obj[key] !== undefined ? obj[key]++ : (obj[key] = 0)

const mocks = (callCount) => ({
  QueryType: {
    nearest() {
      increment(callCount, 'nearest')
      return NearestResponse
    },
    plan(obj, { transportModes }) {
      increment(callCount, 'plan')
      return getPlanResponseMock(transportModes)
    },
    route() {
      increment(callCount, 'route')
      return IndividualRouteResponse
    },
    routes() {
      increment(callCount, 'routes')
      return RoutesResponse
    },
    serviceTimeRange() {
      increment(callCount, 'serviceTimeRange')
      return ServiceTimeRangeResponse
    },
    stop(obj, { id }) {
      increment(callCount, 'stop')
      return getStopResponseMock(id, callCount.stop)
    },
    stopsByRadius() {
      increment(callCount, 'stopsByRoute')
      return StopsByRadiusResponse
    },
    trip() {
      increment(callCount, 'trip')
      return TripResponse
    }
  }
})
module.exports = mocks
