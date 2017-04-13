import DateTimeSelector from './components/form/date-time-selector'
import ErrorMessage from './components/form/error-message'
import LocationField from './components/form/location-field'
import ModeSelector from './components/form/mode-selector'
import PlanTripButton from './components/form/plan-trip-button'
import SwitchButton from './components/form/switch-button'

import BaseLayers from './components/map/base-layers'
import BaseMap from './components/map/base-map'
import BikeRentalOverlay from './components/map/bike-rental-overlay'
import EndpointsOverlay from './components/map/endpoints-overlay'
import ItineraryOverlay from './components/map/itinerary-overlay'
import OsmBaseLayer from './components/map/osm-base-layer'

import ItineraryCarousel from './components/narrative/itinerary-carousel'
import NarrativeItineraries from './components/narrative/narrative-itineraries'
import NarrativeItinerary from './components/narrative/narrative-itinerary'

import { setAutoPlan } from './actions/config'

import createOtpReducer from './reducers/create-otp-reducer'

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
  BikeRentalOverlay,
  EndpointsOverlay,
  ItineraryCarousel,
  ItineraryOverlay,
  OsmBaseLayer,

  // narrative components
  NarrativeItineraries,
  NarrativeItinerary,

  // actions
  setAutoPlan,

  // redux utilities
  createOtpReducer
}
