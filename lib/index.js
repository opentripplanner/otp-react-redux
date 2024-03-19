/* eslint-disable prettier/prettier */
/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */
import DateTimeModal from './components/form/date-time-modal'
import DateTimePreview from './components/form/date-time-preview'
import ErrorMessage from './components/form/error-message'
import LocationField from './components/form/connected-location-field'
import PlanTripButton from './components/form/plan-trip-button'
import SwitchButton from './components/form/switch-button'
import DefaultMap from './components/map/default-map'
import Map from './components/map/map'
import DefaultItinerary from './components/narrative/default/default-itinerary'
import MetroItinerary from './components/narrative/metro/metro-itinerary'
import NarrativeItineraries from './components/narrative/narrative-itineraries'
import NarrativeItinerary from './components/narrative/narrative-itinerary'
import RealtimeAnnotation from './components/narrative/realtime-annotation'
import SimpleRealtimeAnnotation from './components/narrative/simple-realtime-annotation'
import TransportationNetworkCompanyLeg from './components/narrative/default/tnc-leg'
import TripDetails from './components/narrative/connected-trip-details'
import TripTools from './components/narrative/trip-tools'
import MobileMain from './components/mobile/main'
import NavLoginButton from './components/user/nav-login-button'
import NavLoginButtonAuth0 from './components/user/nav-login-button-auth0'
import StopScheduleViewer from './components/viewers/stop-schedule-viewer'
import ViewStopButton from './components/viewers/view-stop-button'
import ViewerContainer from './components/viewers/viewer-container'
import ResponsiveWebapp from './components/app/responsive-webapp'
import AppMenu from './components/app/app-menu'
import DesktopNav from './components/app/desktop-nav'
import BatchRoutingPanel from './components/app/batch-routing-panel'
import BatchResultsScreen from './components/mobile/batch-results-screen'
import BatchSearchScreen from './components/mobile/batch-search-screen'
import FormattedMode from './components/util/formatted-mode'
import { setAutoPlan } from './actions/config'
import { getCurrentPosition } from './actions/location'
import { clearLocation } from './actions/form'
import { setLocationToCurrent, setMapCenter } from './actions/map'
import { findNearbyStops } from './actions/api'
import createCallTakerReducer from './reducers/call-taker'
import createOtpReducer from './reducers/create-otp-reducer'
import createUserReducer from './reducers/create-user-reducer'
import otpUtils from './util'

// TODO: Remove this when we fix the configs for calltaker.
const MobileResultsScreen = BatchResultsScreen
const MobileSearchScreen = BatchSearchScreen

export {
  // form components
  DateTimeModal,
  DateTimePreview,
  ErrorMessage,
  LocationField,
  PlanTripButton,
  SwitchButton,

  // map components
  DefaultMap,
  Map,

  // narrative components
  DefaultItinerary,
  MetroItinerary,
  NarrativeItineraries,
  NarrativeItinerary,
  RealtimeAnnotation,
  SimpleRealtimeAnnotation,
  TransportationNetworkCompanyLeg,
  TripDetails,
  TripTools,

  // mobile components
  MobileMain,
  MobileResultsScreen,
  MobileSearchScreen,

  // viewer components
  StopScheduleViewer,
  ViewerContainer,
  ViewStopButton,

  // user-related components
  NavLoginButton,
  NavLoginButtonAuth0,

  // app components,
  ResponsiveWebapp,
  AppMenu,
  DesktopNav,

  // batch routing components
  BatchResultsScreen,
  BatchRoutingPanel,
  BatchSearchScreen,

  // Util components
  FormattedMode,

  // actions
  clearLocation,
  findNearbyStops,
  getCurrentPosition,
  setAutoPlan,
  setLocationToCurrent,
  setMapCenter,

  // redux utilities
  createCallTakerReducer,
  createOtpReducer,
  createUserReducer,

  // general utilities
  otpUtils
}
