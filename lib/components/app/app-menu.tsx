import { Bus } from '@styled-icons/fa-solid/Bus'
import { connect } from 'react-redux'
import { Envelope } from '@styled-icons/fa-regular/Envelope'
import { ExternalLinkSquareAlt } from '@styled-icons/fa-solid/ExternalLinkSquareAlt'
import { FormattedMessage, injectIntl } from 'react-intl'
import { GlobeAmericas, MapMarked, MapPin } from '@styled-icons/fa-solid'
import { GraduationCap } from '@styled-icons/fa-solid/GraduationCap'
import { History } from '@styled-icons/fa-solid/History'
import { Undo } from '@styled-icons/fa-solid/Undo'
import React, { Component, Fragment, useContext } from 'react'
import SlidingPane from 'react-sliding-pane'
import type { WrappedComponentProps } from 'react-intl'

import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as uiActions from '../../actions/ui'
import { AppMenuItemConfig, LanguageConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import { getLanguageOptions } from '../../util/i18n'
import { isModuleEnabled, Modules } from '../../util/config'

import AppMenuItem from './app-menu-item'
import PopupTriggerText from './popup-trigger-text'

type MenuItem = {
  children?: MenuItem[]
  href?: string
  iconType?: string | JSX.Element
  iconUrl?: string
  id: string
  isSelected?: boolean
  label?: string | JSX.Element
  lang?: string
  onClick?: () => void
  skipLocales?: boolean
  subMenuDivider?: boolean
}

type AppMenuProps = {
  activeLocale: string
  callTakerEnabled?: boolean
  extraMenuItems?: AppMenuItemConfig[]
  fieldTripEnabled?: boolean
  language?: LanguageConfig
  languageOptions: Record<string, any> | null
  mailablesEnabled?: boolean
  popupTarget?: string
  resetAndToggleCallHistory?: () => void
  resetAndToggleFieldTrips?: () => void
  setLocale: (locale: string) => void
  setPopupContent: (url: string) => void
  startOverFromInitialUrl: () => void
  toggleMailables: () => void
}
type AppMenuState = {
  isPaneOpen: boolean
}

/**
 * Sidebar which appears to show user list of options and links
 */
class AppMenu extends Component<
  AppMenuProps & WrappedComponentProps,
  AppMenuState
> {
  static contextType = ComponentContext

  state = {
    isPaneOpen: false
  }

  _startOver = () => {
    this.props.startOverFromInitialUrl()
  }

  _triggerPopup = () => {
    const { popupTarget, setPopupContent } = this.props
    if (popupTarget) setPopupContent(popupTarget)
  }

  _togglePane = () => {
    const { isPaneOpen } = this.state
    this.setState({ isPaneOpen: !isPaneOpen })
  }

  _handleSkipNavigation = () => {
    document.querySelector('main')?.focus()
  }

  _addExtraMenuItems = (menuItems?: MenuItem[] | null) => {
    return (
      menuItems &&
      menuItems.map((menuItem) => {
        const {
          children,
          href,
          iconType,
          iconUrl,
          id,
          isSelected,
          label: configLabel,
          lang,
          onClick,
          skipLocales,
          subMenuDivider
        } = menuItem
        const { activeLocale, language } = this.props
        const localizedLabel = language?.[activeLocale]?.config?.menuItems?.[id]
        const useLocalizedLabel = !skipLocales && localizedLabel
        // Override the config label if a localized label exists
        const label = useLocalizedLabel ? localizedLabel : configLabel

        return (
          <AppMenuItem
            aria-selected={isSelected || undefined}
            className={subMenuDivider ? 'app-menu-divider' : undefined}
            href={href}
            icon={
              iconType && typeof iconType !== 'string' ? (
                iconType
              ) : (
                <Icon iconType={iconType} iconUrl={iconUrl} />
              )
            }
            id={id}
            key={id}
            lang={lang}
            onClick={onClick}
            role={isSelected !== undefined ? 'option' : undefined}
            subItems={this._addExtraMenuItems(children) || undefined}
            text={label}
          />
        )
      })
    )
  }

  render() {
    const {
      activeLocale,
      callTakerEnabled,
      extraMenuItems,
      fieldTripEnabled,
      intl,
      languageOptions,
      mailablesEnabled,
      popupTarget,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      setLocale,
      toggleMailables
    } = this.props
    const languageMenuItems: MenuItem[] | null = languageOptions && [
      {
        children: Object.keys(languageOptions).map((locale: string) => ({
          iconType: <svg />,
          id: locale,
          isSelected: activeLocale === locale,
          label: languageOptions[locale].name,
          lang: locale,
          onClick: () => setLocale(locale),
          skipLocales: true,
          subMenuDivider: false
        })),
        iconType: <GlobeAmericas />,
        id: 'app-menu-locale-selector',
        label: <FormattedMessage id="components.SubNav.languageSelector" />,
        skipLocales: true,
        subMenuDivider: false
      }
    ]

    const { isPaneOpen } = this.state
    const { SvgIcon } = this.context
    const buttonLabel = isPaneOpen
      ? intl.formatMessage({ id: 'components.AppMenu.closeMenu' })
      : intl.formatMessage({ id: 'components.AppMenu.openMenu' })
    const Bar = 'span'

    return (
      <>
        {/* Use a button for skipping navigation. A regular <a href=...> element would modify the URL,
            and such change would be captured by the router without changing the focused element. */}
        <button
          className="skip-nav-button"
          onClick={this._handleSkipNavigation}
        >
          <FormattedMessage id="components.AppMenu.skipNavigation" />
        </button>
        <button
          aria-controls="app-menu"
          aria-expanded={isPaneOpen}
          aria-label={buttonLabel}
          className="app-menu-icon"
          onClick={this._togglePane}
        >
          <Bar className="menu-line top" />
          <Bar className="menu-line middle" />
          <Bar className="menu-line bottom" />
        </button>
        <SlidingPane
          from="left"
          hideHeader
          isOpen={isPaneOpen}
          onRequestClose={() => this.setState({ isPaneOpen: false })}
          shouldCloseOnEsc
          width="320px"
        >
          <div className="app-menu" id="app-menu">
            {/* This item is duplicated by the view-switcher, but only shown on mobile
            when the view switcher isn't shown (using css) */}
            <AppMenuItem
              className="app-menu-trip-planner-link"
              icon={<MapMarked />}
              onClick={this._togglePane}
              text={intl.formatMessage({
                id: 'components.BatchRoutingPanel.shortTitle'
              })}
              to="/"
            />
            {/* This item is duplicated by the view-switcher, but only shown on mobile
            when the view switcher isn't shown (using css) */}
            <AppMenuItem
              className="app-menu-route-viewer-link"
              icon={<Bus />}
              onClick={this._togglePane}
              text={intl.formatMessage({
                id: 'components.RouteViewer.shortTitle'
              })}
              to="/route"
            />
            {/* This item is duplicated by the view-switcher, but only shown on mobile
            when the view switcher isn't shown (using css) */}
            <AppMenuItem
              className="app-menu-route-viewer-link"
              icon={<MapPin />}
              onClick={this._togglePane}
              text={intl.formatMessage({
                id: 'components.ViewSwitcher.nearby'
              })}
              to="/nearby"
            />
            <AppMenuItem
              icon={<Undo />}
              onClick={this._startOver}
              text={intl.formatMessage({
                id: 'common.forms.startOver'
              })}
            />
            {popupTarget && (
              <AppMenuItem
                icon={<SvgIcon iconName={popupTarget} />}
                onClick={this._triggerPopup}
                text={<PopupTriggerText popupTarget={popupTarget} />}
              />
            )}
            {callTakerEnabled && (
              <AppMenuItem
                icon={<History />}
                onClick={resetAndToggleCallHistory}
                text={intl.formatMessage({
                  id: 'components.AppMenu.callHistory'
                })}
              />
            )}
            {fieldTripEnabled && (
              <AppMenuItem
                icon={<GraduationCap />}
                onClick={resetAndToggleFieldTrips}
                text={intl.formatMessage({
                  id: 'components.AppMenu.fieldTrip'
                })}
              />
            )}
            {mailablesEnabled && (
              <AppMenuItem
                icon={<Envelope />}
                onClick={toggleMailables}
                text={intl.formatMessage({
                  id: 'components.AppMenu.mailables'
                })}
              />
            )}
            {this._addExtraMenuItems(extraMenuItems)}
            {this._addExtraMenuItems(languageMenuItems)}
          </div>
        </SlidingPane>
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const { extraMenuItems, language, popups } = state.otp.config
  return {
    activeLocale: state.otp.ui.locale,
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
    extraMenuItems,
    fieldTripEnabled: isModuleEnabled(state, Modules.FIELD_TRIP),
    language,
    languageOptions: getLanguageOptions(language),
    mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES),
    popupTarget: popups?.launchers?.sidebarLink
  }
}

const mapDispatchToProps = {
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips,
  setLocale: uiActions.setLocale,
  setPopupContent: uiActions.setPopupContent,
  startOverFromInitialUrl: uiActions.startOverFromInitialUrl,
  toggleMailables: callTakerActions.toggleMailables
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(AppMenu))

/**
 * Renders a label and icon either from url or font awesome type
 */
export const Icon = ({
  iconType,
  iconUrl
}: {
  iconType?: string
  iconUrl?: string
}): JSX.Element => {
  // FIXME: add types to context
  // @ts-expect-error No type on ComponentContext
  const { SvgIcon } = useContext(ComponentContext)
  return iconUrl ? (
    <img alt="" src={iconUrl} />
  ) : iconType ? (
    <SvgIcon iconName={iconType} />
  ) : (
    <ExternalLinkSquareAlt />
  )
}
