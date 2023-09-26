// This file is intended to contain configuration types,
// each suffixed with "Config", as in "MapConfig", "MenuItemConfig", etc.

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

/** Generic API key config */
interface ApiKeyConfig {
  key: string
}

/** Bugsnag */
export type BugsnagConfig = ApiKeyConfig

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

/** Mapillary settings */
export type MapillaryConfig = ApiKeyConfig

/** The main application configuration object */
export interface AppConfig {
  /** Whether the header brand should be clickable, and if so, reset the UI. */
  brandClickable?: boolean
  branding?: string
  bugsnag: BugsnagConfig
  extraMenuItems?: AppMenuItemConfig[]
  homeTimezone: string
  /** Enable touch-friendly behavior on e.g. touch-screen kiosks that run a desktop OS. */
  isTouchScreenOnDesktop?: boolean
  language?: LanguageConfig
  localization?: LocalizationConfig
  mapillary?: MapillaryConfig
  /** Interval in seconds past which a trip is no longer considered "on-time". */
  onTimeThresholdSeconds?: number
  persistence?: PersistenceConfig
  // Optional on declaration, populated with defaults in reducer if not configured.
  phoneFormatOptions: PhoneFormatConfig
  popups?: PopupConfig
  /** Approx delay in seconds to reset the UI to an initial URL if there is no user activity */
  sessionTimeoutSeconds?: number
  title?: string

  // TODO: add other config items.
}
