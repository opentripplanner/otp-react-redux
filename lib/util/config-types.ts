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
  VehicleRentalMapOverlaySymbol
} from '@opentripplanner/types'

/** OTP URL settings */
export interface ApiConfig {
  host: string
  path: string
  port: number
  v2?: boolean
}

/** Application side menu */
export interface AppMenuItemConfig {
  children?: AppMenuItemConfig[]
  href?: string
  iconType: string | JSX.Element
  iconUrl?: string
  id: string
  isSelected?: boolean
  label: string | JSX.Element
  lang?: string
  onClick?: () => void
  skipLocales?: boolean
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

/** OTP Middleware (Personas) settings */
export interface OtpMiddlewareConfig {
  apiBaseUrl: string
  apiKey?: string
  supportsPushNotifications?: boolean
}

export interface LocalPersistenceConfig {
  strategy: 'localStorage'
  // eslint-disable-next-line camelcase
  terms_of_storage?: boolean
}

export interface MiddlewarePersistenceConfig {
  auth0: Auth0Config
  // eslint-disable-next-line camelcase
  otp_middleware: OtpMiddlewareConfig
  strategy: 'otp_middleware'
}

/** General persistence settings */
export type PersistenceConfig = (
  | LocalPersistenceConfig
  | MiddlewarePersistenceConfig
) & {
  enabled?: boolean
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

export interface ItineraryConfig {
  costs?: ItineraryCostConfig
  customBatchUiBackground?: boolean
  defaultFareType?: FareProductSelector
  defaultSort?: ItinerarySortOption
  disableMetroSeperatorDot?: true
  fareDetailsLayout?: FareTableLayout[]
  fareKeyNameMap?: Record<string, string>
  fillModeIcons?: boolean
  groupByMode?: boolean
  groupTransitModes?: boolean
  hideSkeletons?: boolean
  mergeItineraries?: boolean
  renderRouteNamesInBlocks?: boolean
  showFirstResultByDefault?: boolean
  showHeaderText?: boolean
  showLegDurations?: boolean
  showPlanFirstLastButtons?: boolean
  showRouteFares?: boolean
  sortModes?: ItinerarySortOption[]
}

export interface CO2Config extends CO2ConfigType {
  cutoffPercentage?: number
  // FIXME: merge with the CO2ConfigType's unit field.
  massUnit?: MassUnitOption
  showIfHigher?: boolean
}

/** The main application configuration object */
export interface AppConfig {
  api: ApiConfig
  // Optional on declaration, populated with defaults in reducer if not configured.
  autoPlan: AutoPlanConfig
  /** Whether the header brand should be clickable, and if so, reset the UI. */
  brandClickable?: boolean
  branding?: string
  bugsnag?: BugsnagConfig
  co2?: CO2Config
  companies?: Company[]
  extraMenuItems?: AppMenuItemConfig[]
  homeTimezone: string
  /** Enable touch-friendly behavior on e.g. touch-screen kiosks that run a desktop OS. */
  isTouchScreenOnDesktop?: boolean
  itinerary?: ItineraryConfig
  language?: LanguageConfig
  localization?: LocalizationConfig
  map: MapConfig
  mapillary?: MapillaryConfig
  /** Interval in seconds past which a trip is no longer considered "on-time". */
  onTimeThresholdSeconds?: number
  persistence?: PersistenceConfig
  // Optional on declaration, populated with defaults in reducer if not configured.
  phoneFormatOptions: PhoneFormatConfig
  popups?: PopupConfig
  reportIssue?: ReportIssueConfig
  /** Approx delay in seconds to reset the UI to an initial URL if there is no user activity */
  sessionTimeoutSeconds?: number
  /** App title shown in the browser title bar. */
  title?: string

  // TODO: add other config items.
}
