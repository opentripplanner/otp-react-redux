import coreUtils from '@opentripplanner/core-utils'
import * as distance from './distance'
import * as itinerary from './itinerary'
import * as state from './state'
import * as ui from './ui'

const OtpUtils = {
  ...coreUtils,
  distance,
  itinerary,
  state,
  ui
}

export default OtpUtils
