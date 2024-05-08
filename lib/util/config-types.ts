// This file is intended to contain configuration types,
// each suffixed with "Config", as in "MapConfig", "MenuItemConfig", etc.

import {
  CO2ConfigType,
  FareTableLayout
} from '@opentripplanner/trip-details/lib/types'
import {
  Company,
  FareProductSelector,
  MassUnitOption,
  ModeButtonDefinition,
  ModeSetting,
  ModeSettingValues,
  TransitOperator,
  VehicleRentalMapOverlaySymbol
} from '@opentripplanner/types'
import { GeocoderConfig as GeocoderConfigOtpUI } from '@opentripplanner/geocoder'

/** Accessibility threshold settings */
export interface AccessibilityScoreThresholdConfig {
  color: string
  icon: string
  text?: string
}

/** All accessibility score settings */
export interface AccessibilityScoreConfig {
  gradationMap: Record<string, AccessibilityScoreThresholdConfig>
}

/** OTP URL settings */
export interface ApiConfig {
  basePath?: string
  host: string
  // Soon to be deprecated
  path: string
  port: number
  // Soon to be deprecated
  v2?: boolean
}

/** Application side menu */
export interface AppMenuItemConfig {
  children?: AppMenuItemConfig[]
  href?: string
  iconType?: string
  iconUrl?: string
  id: string
  label?: string
  subMenuDivider?: boolean
}

export type AutoPlanCondition =
  | 'ONE_LOCATION_CHANGED'
  | 'BOTH_LOCATIONS_CHANGED'

export interface AutoPlanConfig {
  default: AutoPlanCondition
  mobile: AutoPlanCondition
}

/** Generic API key config */
interface ApiKeyConfig {
  key: string
}

export type BugsnagConfig = ApiKeyConfig
export type MapillaryConfig = ApiKeyConfig

export type NearbyViewConfig = {
  hideEmptyStops?: boolean
  radius?: number
  useRouteViewSort?: boolean
}

/** TODO: Language settings */
export type LanguageConfig = Record<string, any>

export interface LocalizationConfig {
  defaultLocale: string
}

/** Auth0 settings */
export interface Auth0Config {
  audience: string
  clientId: string
  domain: string
}

/** Local persistence setting */
export interface LocalPersistenceConfig {
  strategy: 'localStorage'
  // eslint-disable-next-line camelcase
  terms_of_storage?: boolean
}

/** OTP Middleware (Personas) settings */
export interface MiddlewarePersistenceConfig {
  auth0: Auth0Config
  // eslint-disable-next-line camelcase
  otp_middleware: {
    apiBaseUrl: string
    apiKey?: string
    supportsPushNotifications?: boolean
  }
  strategy: 'otp_middleware'
}

/** General persistence settings */
export type PersistenceConfig = (
  | LocalPersistenceConfig
  | MiddlewarePersistenceConfig
) & {
  enabled?: boolean
  // eslint-disable-next-line camelcase
  terms_of_storage?: boolean
}

/** Popup target settings */
export interface PopupTargetConfig {
  appendLocale?: boolean
  modal?: boolean
  url?: string
}

/** Supported popup launchers */
export type PopupLauncher =
  /** This button is rendered at the bottom of a selected itinerary */
  | 'itineraryFooter'
  /** This button is rendered to the left of the itinerary filter in the batch and metro UIs */
  | 'optionFilter'
  /** This button is rendered in the sidebar */
  | 'sidebarLink'
  /** This button is rendered in the top right of the toolbar (desktop view only!) */
  | 'toolbar'

/** Popup settings */
export interface PopupConfig {
  launchers: Record<PopupLauncher, string>
  targets: Record<PopupLauncher, PopupTargetConfig>
}

/** Phone format options */
export interface PhoneFormatConfig {
  countryCode: string
}

/** Map base layers (e.g. streets, satellite) */
export interface BaseLayerConfig {
  name?: string
  type?: string
  url: string
}

/** Map views (e.g. default, stylized) */
export interface MapViewConfig {
  text: string
  type: string // TODO use a list of values.
}

export interface OverlayConfigBase {
  modes?: string[] // TODO use allowed OTP mode list.
  name?: string
  visible?: boolean
}

export interface ParkAndRideOverlayConfig extends OverlayConfigBase {
  maxTransitDistance?: number
  type: 'park-and-ride'
}

export interface Otp1StopsOverlayConfig extends OverlayConfigBase {
  type: 'stops'
}

export interface Otp2TileLayer {
  color?: string
  initiallyVisible?: boolean
  network?: string
  type: 'stops' | 'stations' | 'rentalVehicles' | 'rentalStations'
}

export interface Otp2TileLayerConfig {
  layers: Otp2TileLayer[]
  type: 'otp2'
}

export interface MapTileLayerConfig extends OverlayConfigBase {
  tileUrl: string
  type: 'tile'
}

export interface RentalOverlayConfig extends OverlayConfigBase {
  companies?: string[]
  mapSymbols: VehicleRentalMapOverlaySymbol[]
  type:
    | 'bike-rental'
    | 'micromobility-rental'
    | 'otp2-micromobility-rental'
    | 'otp2-bike-rental'
}

export type SupportedOverlays =
  | ParkAndRideOverlayConfig
  | RentalOverlayConfig
  | Otp2TileLayerConfig
  | Otp1StopsOverlayConfig
  | MapTileLayerConfig

export interface MapConfig {
  baseLayers?: BaseLayerConfig[]
  initLat?: number
  initLon?: number
  initZoom?: number
  maxZoom?: number
  overlays?: SupportedOverlays[]
  views?: MapViewConfig[]
}

/** Settings for reporting issues */
export interface ReportIssueConfig {
  mailto: string
}

export interface ItineraryCostConfig {
  bikeshareTripCostCents?: number
  carParkingCostCents?: number
  drivingCentsPerMile?: number
}

export type ItinerarySortOption =
  | 'BEST'
  | 'DURATION'
  | 'ARRIVALTIME'
  | 'WALKTIME'
  | 'COST'
  | 'DEPARTURETIME'

export interface ItineraryCostWeights {
  driveReluctance: number
  durationFactor: number
  fareFactor: number
  transferReluctance: number
  waitReluctance: number
  walkReluctance: number
}

export interface ItineraryConfig {
  allowUserAlertCollapsing?: boolean
  costs?: ItineraryCostConfig
  customBatchUiBackground?: boolean
  defaultFareType?: FareProductSelector
  defaultSort?: ItinerarySortOption
  disableMetroSeperatorDot?: true
  exclusiveErrors?: string[]
  fareDetailsLayout?: FareTableLayout[]
  fareKeyNameMap?: Record<string, string>
  fillModeIcons?: boolean
  groupByMode?: boolean
  groupTransitModes?: boolean
  hideSkeletons?: boolean
  mergeItineraries?: boolean
  mutedErrors?: string[]
  onlyShowCountdownForRealtime?: boolean
  previewOverlay?: boolean
  renderRouteNamesInBlocks?: boolean
  showFirstResultByDefault?: boolean
  showHeaderText?: boolean
  showLegDurations?: boolean
  showPlanFirstLastButtons?: boolean
  showRouteFares?: boolean
  sortModes?: ItinerarySortOption[]
  weights?: ItineraryCostWeights
}

export interface CO2Config extends CO2ConfigType {
  cutoffPercentage?: number
  // FIXME: merge with the CO2ConfigType's unit field.
  massUnit?: MassUnitOption
  showIfHigher?: boolean
}

export interface GeocoderConfig extends GeocoderConfigOtpUI {
  maxNearbyStops?: number
  resultColors?: Record<string, string>
  resultsCount?: number
  type: string
}

export interface TransitModeConfig {
  color?: string
  label?: string
  mode: string
  showWheelchairSetting?: boolean
}

export interface ModesConfig {
  accessModes: TransitModeConfig[]
  initialState?: {
    enabledModeButtons?: string[]
    modeSettingValues?: ModeSettingValues
  }
  modeButtons?: ModeButtonDefinition[]
  modeSettingDefinitions?: ModeSetting[]
  transitModes: TransitModeConfig[]
}

export interface ModeColorConfig {
  color: string
  textColor: string
}

export interface TransitOperatorConfig extends TransitOperator {
  colorMode?: 'gtfs' | 'gtfs-softened' | 'disabled'
  modeColors?: Record<string, ModeColorConfig>
  routeIcons?: boolean
}

/** Route Viewer config */
export interface RouteViewerConfig {
  /** Whether to hide the route linear shape inside a flex zone of that route. */
  hideRouteShapesWithinFlexZones?: boolean
  /** Remove vehicles from the map if they haven't sent an update in a number of seconds */
  maxRealtimeVehicleAge?: number
  /** Disable vehicle highlight if necessary (e.g. custom or inverted icons) */
  vehicleIconHighlight?: boolean
  /** Customize vehicle icon padding (the default iconPadding is 2px in otp-ui) */
  vehicleIconPadding?: number
  /** Interval for refreshing vehicle positions */
  vehiclePositionRefreshSeconds?: number
}

/** Stop Schedule Viewer Config */
export interface StopScheduleViewerConfig {
  /** Whether to display block IDs with each departure in the schedule view. */
  showBlockIds?: boolean
}

/** The main application configuration object */
export interface AppConfig {
  accessibilityScore?: AccessibilityScoreConfig
  api: ApiConfig
  // Optional on declaration, populated with defaults in reducer if not configured.
  autoPlan?: boolean | AutoPlanConfig
  /** Whether the header brand should be clickable, and if so, reset the UI. */
  brandClickable?: boolean
  branding?: string
  bugsnag?: BugsnagConfig
  co2?: CO2Config
  companies?: Company[]
  elevationProfile?: boolean
  extraMenuItems?: AppMenuItemConfig[]
  geocoder: GeocoderConfig
  homeTimezone: string
  /** Enable touch-friendly behavior on e.g. touch-screen kiosks that run a desktop OS. */
  isTouchScreenOnDesktop?: boolean
  itinerary?: ItineraryConfig
  language?: LanguageConfig
  localization?: LocalizationConfig
  map: MapConfig
  mapillary?: MapillaryConfig
  mobilityProfile?: boolean
  modes: ModesConfig
  nearbyView?: NearbyViewConfig
  /** Interval in seconds past which a trip is no longer considered "on-time". */
  onTimeThresholdSeconds?: number
  persistence?: PersistenceConfig
  // Optional on declaration, populated with defaults in reducer if not configured.
  phoneFormatOptions: PhoneFormatConfig
  popups?: PopupConfig
  reportIssue?: ReportIssueConfig
  routeModeOverrides?: Record<string, string>
  routeViewer?: RouteViewerConfig
  /** Approx delay in seconds to reset the UI to an initial URL if there is no user activity */
  sessionTimeoutSeconds?: number
  /** Whether to show the x minutes late/early in the itinerary body */
  showScheduleDeviation?: boolean
  stopViewer?: StopScheduleViewerConfig
  /** Externally hosted terms of service URL */
  termsOfServiceLink?: string
  /** App title shown in the browser title bar. */
  title?: string
  transitOperators?: TransitOperatorConfig[]

  // Add other config items as needed.
}
