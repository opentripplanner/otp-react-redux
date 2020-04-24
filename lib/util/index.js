import coreUtils from '@opentripplanner/core-utils'
import * as distance from './distance'
import * as itinerary from './itinerary'
import * as state from './state'

const OtpUtils = {
  ...coreUtils,
  distance,
  itinerary,
  state
}

export default OtpUtils
