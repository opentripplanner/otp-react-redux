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

/** Bugsnag */
export interface BugsnagConfig {
  key: string
}

/** TODO: Language settings */
export type LanguageConfig = Record<string, any>

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

/** The main application configuration object */
export interface AppConfig {
  brandClickable?: boolean
  branding?: string
  bugsnag: BugsnagConfig
  extraMenuItems?: AppMenuItemConfig[]
  language?: LanguageConfig
  persistence?: PersistenceConfig
  popups?: PopupConfig
  title?: string

  // TODO: add other config items.
}
