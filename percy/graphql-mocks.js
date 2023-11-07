const PlanResponseBike = require('./mocks/PlanResponseBike.json').data.plan
const PlanResponseWalk = require('./mocks/PlanResponseWalk.json').data.plan
const PlanResponseBusSubwayTram =
  require('./mocks/PlanResponseBusSubwayTram.json').data.plan
function getPlanResponseMock(transportModes) {
  const transportModesString = transportModes
    .map((tm) => tm.mode)
    .sort()
    .join('')
  console.log(transportModesString)
  switch (transportModesString) {
    case 'BICYCLEBUSSUBWAYTRAM':
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
    plan(obj, { transportModes }) {
      return getPlanResponseMock(transportModes)
    }
  }
}
module.exports = mocks
