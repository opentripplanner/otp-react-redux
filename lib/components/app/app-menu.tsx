import { Bus } from '@styled-icons/fa-solid/Bus'
import { connect } from 'react-redux'
import { Envelope } from '@styled-icons/fa-regular/Envelope'
import { ExternalLinkSquareAlt } from '@styled-icons/fa-solid/ExternalLinkSquareAlt'
import { FormattedMessage, injectIntl } from 'react-intl'
import { GlobeAmericas, MapMarked } from '@styled-icons/fa-solid'
import { GraduationCap } from '@styled-icons/fa-solid/GraduationCap'
import { History } from '@styled-icons/fa-solid/History'
import { Undo } from '@styled-icons/fa-solid/Undo'
import { withRouter } from 'react-router'
import React, { Component, Fragment, useContext } from 'react'
import SlidingPane from 'react-sliding-pane'
import type { RouteComponentProps } from 'react-router'
import type { WrappedComponentProps } from 'react-intl'

import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import { getLanguageOptions } from '../../util/i18n'
import { isModuleEnabled, Modules } from '../../util/config'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import startOver from '../util/start-over'

import AppMenuItem from './app-menu-item'

type AppMenuProps = {
  activeLocale: string
  callTakerEnabled?: boolean
  // Typescript TODO configLanguageType
  configLanguages?: Record<string, any>
  extraMenuItems?: menuItem[]
  fieldTripEnabled?: boolean
  location: { search: string }
  mailablesEnabled?: boolean
  popupTarget: string
  reactRouterConfig?: { basename: string }
  resetAndToggleCallHistory?: () => void
  resetAndToggleFieldTrips?: () => void
  setLocale: (locale: string) => void
  setMainPanelContent: (panel: number | null) => void
  setPopupContent: (url: string) => void
  toggleMailables: () => void
}
type AppMenuState = {
  isPaneOpen: boolean
}
type menuItem = {
  children?: menuItem[]
  href?: string
  iconType: string | JSX.Element
  iconUrl?: string
  id: string
  isRadio?: boolean
  label: string | JSX.Element
  onClick?: () => void
  subMenuDivider: boolean
}

/**
 * Sidebar which appears to show user list of options and links
 */
class AppMenu extends Component<
  AppMenuProps & WrappedComponentProps & RouteComponentProps,
  AppMenuState
> {
  static contextType = ComponentContext

  state = {
    isPaneOpen: false
  }

  _showRouteViewer = () => {
    this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
    this._togglePane()
  }

  _startOver = () => {
    const { location, reactRouterConfig } = this.props
    const { search } = location
    window.location.href = startOver(reactRouterConfig?.basename, search)
  }

  _triggerPopup = () => {
    const { popupTarget, setPopupContent } = this.props
    setPopupContent(popupTarget)
    this._togglePane()
  }

  _togglePane = () => {
    const { isPaneOpen } = this.state
    this.setState({ isPaneOpen: !isPaneOpen })
  }

  _showTripPlanner = () => {
    this.props.setMainPanelContent(null)
    this._togglePane()
  }

  _handleSkipNavigation = () => {
    document.querySelector('main')?.focus()
  }

  _addExtraMenuItems = (menuItems?: menuItem[] | null) => {
    return (
      menuItems &&
      menuItems.map((menuItem) => {
        const {
          children,
          href,
          iconType,
          iconUrl,
          id,
          isRadio,
          label: configLabel,
          onClick,
          subMenuDivider
        } = menuItem
        const { intl } = this.props
        const localizationId = `config.menuItems.${id}`
        const localizedLabel = intl.formatMessage({ id: localizationId })
        // Override the config label if a localized label exists
        const label =
          localizedLabel === localizationId ? configLabel : localizedLabel

        return (
          <AppMenuItem
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
            isRadio={isRadio}
            key={id}
            onClick={onClick}
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
      configLanguages,
      extraMenuItems,
      fieldTripEnabled,
      intl,
      mailablesEnabled,
      popupTarget,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      setLocale,
      toggleMailables
    } = this.props

    const languageOptions: Record<string, any> | null =
      getLanguageOptions(configLanguages)
    const languageMenuItems: menuItem[] | null = languageOptions && [
      {
        children: Object.keys(languageOptions).map((locale: string) => ({
          iconType: <svg />,
          id: locale,
          isRadio: true,
          label:
            activeLocale === locale ? (
              <strong>{languageOptions[locale].name}</strong>
            ) : (
              languageOptions[locale].name
            ),
          onClick: () => setLocale(locale),
          subMenuDivider: false
        })),
        iconType: <GlobeAmericas />,
        id: 'app-menu-locale-selector',
        label: <FormattedMessage id="components.SubNav.languageSelector" />,
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
          onRequestClose={this._togglePane}
          shouldCloseOnEsc
          width="320px"
        >
          <div className="app-menu" id="app-menu">
            {/* This item is duplicated by the view-switcher, but only shown on mobile
            when the view switcher isn't shown (using css) */}
            <AppMenuItem
              className="app-menu-trip-planner-link"
              icon={<MapMarked />}
              onClick={this._showTripPlanner}
              text={
                <FormattedMessage id="components.BatchRoutingPanel.shortTitle" />
              }
            />
            {/* This item is duplicated by the view-switcher, but only shown on mobile
            when the view switcher isn't shown (using css) */}
            <AppMenuItem
              className="app-menu-route-viewer-link"
              icon={<Bus />}
              onClick={this._showRouteViewer}
              text={<FormattedMessage id="components.RouteViewer.shortTitle" />}
            />
            <AppMenuItem
              icon={<Undo />}
              onClick={this._startOver}
              text={<FormattedMessage id="common.forms.startOver" />}
            />
            {popupTarget && (
              <AppMenuItem
                icon={<SvgIcon iconName={popupTarget} />}
                onClick={this._triggerPopup}
                text={<FormattedMessage id={`config.popups.${popupTarget}`} />}
              />
            )}
            {callTakerEnabled && (
              <AppMenuItem
                icon={<History />}
                onClick={resetAndToggleCallHistory}
                text={<FormattedMessage id="components.AppMenu.callHistory" />}
              />
            )}
            {fieldTripEnabled && (
              <AppMenuItem
                icon={<GraduationCap />}
                onClick={resetAndToggleFieldTrips}
                text={<FormattedMessage id="components.AppMenu.fieldTrip" />}
              />
            )}
            {mailablesEnabled && (
              <AppMenuItem
                icon={<Envelope />}
                onClick={toggleMailables}
                text={<FormattedMessage id="components.AppMenu.mailables" />}
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

// FIXME: type otp config
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapStateToProps = (state: Record<string, any>) => {
  const { extraMenuItems, language } = state.otp.config
  return {
    activeLocale: state.otp.ui.locale,
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
    configLanguages: language,
    extraMenuItems,
    fieldTripEnabled: isModuleEnabled(state, Modules.FIELD_TRIP),
    mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES),
    popupTarget: state.otp.config?.popups?.launchers?.sidebarLink
  }
}

const mapDispatchToProps = {
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips,
  setLocale: uiActions.setLocale,
  setMainPanelContent,
  setPopupContent: uiActions.setPopupContent,
  toggleMailables: callTakerActions.toggleMailables
}

export default injectIntl(
  // @ts-expect-error TODO: type setMainPanelContent correctly
  withRouter(connect(mapStateToProps, mapDispatchToProps)(AppMenu))
)

/**
 * Renders a label and icon either from url or font awesome type
 */
const Icon = ({
  iconType,
  iconUrl
}: {
  iconType: string
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
