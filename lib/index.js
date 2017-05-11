import DateTimeSelector from './components/form/date-time-selector'
import ErrorMessage from './components/form/error-message'
import LocationField from './components/form/location-field'
import ModeSelector from './components/form/mode-selector'
import PlanTripButton from './components/form/plan-trip-button'
import SwitchButton from './components/form/switch-button'

import BaseLayers from './components/map/base-layers'
import BaseMap from './components/map/base-map'
import EndpointsOverlay from './components/map/endpoints-overlay'
import ItineraryOverlay from './components/map/itinerary-overlay'
import OsmBaseLayer from './components/map/osm-base-layer'

import ItineraryCarousel from './components/narrative/itinerary-carousel'
import NarrativeItineraries from './components/narrative/narrative-itineraries'
import NarrativeItinerary from './components/narrative/narrative-itinerary'

import { setAutoPlan } from './actions/config'
import { getCurrentPosition } from './actions/location'

import createOtpReducer from './reducers/create-otp-reducer'

import * as distanceUtils from './util/distance'
import * as itinUtils from './util/itinerary'
import * as mapUtils from './util/map'
import * as timeUtils from './util/time'

const OtpUtils = {
  distance: distanceUtils,
  itinerary: itinUtils,
  map: mapUtils,
  time: timeUtils
}

export {
  // form components
  DateTimeSelector,
  ErrorMessage,
  LocationField,
  ModeSelector,
  PlanTripButton,
  SwitchButton,

  // map components
  BaseLayers,
  BaseMap,
  EndpointsOverlay,
  ItineraryCarousel,
  ItineraryOverlay,
  OsmBaseLayer,

  // narrative components
  NarrativeItineraries,
  NarrativeItinerary,

  // actions
  getCurrentPosition,
  setAutoPlan,

  // redux utilities
  createOtpReducer,

  // general utilities
  OtpUtils
}
