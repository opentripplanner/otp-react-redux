const PlanResponseBike = require('./mocks/PlanResponseBike.json').data.plan
const PlanResponseWalk = require('./mocks/PlanResponseWalk.json').data.plan
const PlanResponseBusSubwayTram =
  require('./mocks/PlanResponseBusSubwayTram.json').data.plan
const TripResponse = require('./mocks/TripResponse.json').data.trip
const NearestResponse = require('./mocks/NearbyResponse.json').data.nearest
const StopResponse = require('./mocks/Stop114900Response.json').data.stop
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

const mocks = {
  QueryType: {
    nearest() {
      return NearestResponse
    },
    plan(obj, { transportModes }) {
      return getPlanResponseMock(transportModes)
    },
    route() {
      return IndividualRouteResponse
    },
    routes() {
      return RoutesResponse
    },
    serviceTimeRange() {
      return ServiceTimeRangeResponse
    },
    stop() {
      return StopResponse
    },
    stopsByRadius() {
      return StopsByRadiusResponse
    },
    trip() {
      return TripResponse
    }
  }
}
module.exports = mocks
