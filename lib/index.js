import DateTimeModal from './components/form/date-time-modal'
import DateTimePreview from './components/form/date-time-preview'
import DefaultSearchForm from './components/form/default-search-form'
import ErrorMessage from './components/form/error-message'
import LocationField from './components/form/connected-location-field'
import PlanTripButton from './components/form/plan-trip-button'
import SettingsPreview from './components/form/settings-preview'
import SwitchButton from './components/form/switch-button'

import DefaultMap from './components/map/default-map'
import Map from './components/map/map'
import StylizedMap from './components/map/stylized-map'
import OsmBaseLayer from './components/map/osm-base-layer'
import TileOverlay from './components/map/tile-overlay'

import ItineraryCarousel from './components/narrative/itinerary-carousel'
import NarrativeItineraries from './components/narrative/narrative-itineraries'
import NarrativeItinerary from './components/narrative/narrative-itinerary'
import NarrativeRoutingResults from './components/narrative/narrative-routing-results'
import RealtimeAnnotation from './components/narrative/realtime-annotation'
import SimpleRealtimeAnnotation from './components/narrative/simple-realtime-annotation'
import TransportationNetworkCompanyLeg from './components/narrative/default/tnc-leg'
import TripDetails from './components/narrative/connected-trip-details'
import TripTools from './components/narrative/trip-tools'
import LineItinerary from './components/narrative/line-itin/line-itinerary'

import MobileMain from './components/mobile/main'

import NavLoginButton from './components/user/nav-login-button'
import NavLoginButtonAuth0 from './components/user/nav-login-button-auth0'

import StopViewer from './components/viewers/stop-viewer'
import ViewStopButton from './components/viewers/view-stop-button'
import ViewTripButton from './components/viewers/view-trip-button'
import ViewerContainer from './components/viewers/viewer-container'

import ResponsiveWebapp from './components/app/responsive-webapp'
import AppMenu from './components/app/app-menu'
import DesktopNav from './components/app/desktop-nav'
import DefaultMainPanel from './components/app/default-main-panel'

import { setAutoPlan, setMapCenter } from './actions/config'
import { getCurrentPosition } from './actions/location'
import { setLocationToCurrent, clearLocation } from './actions/map'
import { setUseRealtimeResponse } from './actions/narrative'
import { findNearbyStops } from './actions/api'

import createOtpReducer from './reducers/create-otp-reducer'
import createUserReducer from './reducers/create-user-reducer'

import otpUtils from './util'

export {
  // form components
  DateTimeModal,
  DateTimePreview,
  DefaultSearchForm,
  ErrorMessage,
  LocationField,
  PlanTripButton,
  SettingsPreview,
  StylizedMap,
  SwitchButton,

  // map components
  DefaultMap,
  ItineraryCarousel,
  Map,
  OsmBaseLayer,
  TileOverlay,

  // narrative components
  LineItinerary,
  NarrativeItineraries,
  NarrativeItinerary,
  NarrativeRoutingResults,
  RealtimeAnnotation,
  SimpleRealtimeAnnotation,
  TransportationNetworkCompanyLeg,
  TripDetails,
  TripTools,

  // mobile compoments
  MobileMain,

  // viewer components
  StopViewer,
  ViewerContainer,
  ViewStopButton,
  ViewTripButton,

  // user-related components
  NavLoginButton,
  NavLoginButtonAuth0,

  // app components,
  ResponsiveWebapp,
  AppMenu,
  DesktopNav,
  DefaultMainPanel,

  // actions
  clearLocation,
  findNearbyStops,
  getCurrentPosition,
  setAutoPlan,
  setLocationToCurrent,
  setMapCenter,
  setUseRealtimeResponse,

  // redux utilities
  createOtpReducer,
  createUserReducer,

  // general utilities
  otpUtils
}
