// This file is intended to contain configuration types,
// each suffixed with "Config", as in "MapConfig", "MenuItemConfig", etc.

/** Configuration object for the application menu */
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

export interface BugsnagConfig {
  key: string
}

/** TODO: Configuration object for language settings */
export type LanguageConfig = Record<string, any>

export interface PopupTargetConfig {
  appendLocale?: boolean
  modal?: boolean
  url?: string
}

export type PopupLauncher =
  /** This button is rendered at the bottom of a selected itinerary */
  | 'itineraryFooter'
  /** This button is rendered to the left of the itinerary filter in the batch and metro UIs */
  | 'optionFilter'
  /** This button is rendered in the sidebar */
  | 'sidebarLink'
  /** This button is rendered in the top right of the toolbar (desktop view only!) */
  | 'toolbar'

/** Configuration object for popups */
export interface PopupConfig {
  launchers: Record<PopupLauncher, string>
  targets: Record<PopupLauncher, PopupTargetConfig>
}

/** The main application configuration object */
export interface AppConfig {
  bugsnag: BugsnagConfig
  extraMenuItems?: AppMenuItemConfig[]
  language?: LanguageConfig
  popups?: PopupConfig

  // TODO: add other config items.
}
