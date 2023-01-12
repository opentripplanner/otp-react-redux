import { Bus } from '@styled-icons/fa-solid/Bus'
import { connect } from 'react-redux'
import { Envelope } from '@styled-icons/fa-regular/Envelope'
import { ExternalLinkSquareAlt } from '@styled-icons/fa-solid/ExternalLinkSquareAlt'
import { FormattedMessage, injectIntl } from 'react-intl'
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
import { isModuleEnabled, Modules } from '../../util/config'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import startOver from '../util/start-over'

import AppMenuItem from './app-menu-item'

type AppMenuProps = {
  callTakerEnabled?: boolean
  extraMenuItems?: menuItem[]
  fieldTripEnabled?: boolean
  location: { search: string }
  mailablesEnabled?: boolean
  popupTarget: string
  reactRouterConfig?: { basename: string }
  resetAndToggleCallHistory?: () => void
  resetAndToggleFieldTrips?: () => void
  setMainPanelContent: (panel: number) => void
  setPopupContent: (url: string) => void
  toggleMailables: () => void
}
type AppMenuState = {
  isPaneOpen: boolean
}
type menuItem = {
  children: menuItem[]
  href: string
  iconType: string
  iconUrl: string
  id: string
  label: string
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

  appMenuButtonRef = React.createRef()
  appMenuContainerRef = React.createRef()

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

  _handleAfterOpen = () => {
    // a11y: Return the keyboard focus to the app menu button after the side menu appears.
    this.appMenuButtonRef.current.focus()
  }

  _handleMenuButtonKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      if (this.state.isPaneOpen) {
        this.appMenuContainerRef.current
          .querySelector('a, button')
          ?.focus({ focusVisible: true })
      } else {
        this._togglePane()
      }
    }
  }

  _handleSkipNavigation = () => {
    document.querySelector('main')?.focus()
  }

  _addExtraMenuItems = (menuItems?: menuItem[]) => {
    return (
      menuItems &&
      menuItems.map((menuItem) => {
        const {
          children,
          href,
          iconType,
          iconUrl,
          id,
          label: configLabel,
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
            className={subMenuDivider ? 'app-menu-divider' : null}
            href={href}
            icon={<Icon iconType={iconType} iconUrl={iconUrl} />}
            id={id}
            key={id}
            subItems={this._addExtraMenuItems(children)}
            text={label}
          />
        )
      })
    )
  }

  render() {
    const {
      callTakerEnabled,
      extraMenuItems,
      fieldTripEnabled,
      intl,
      mailablesEnabled,
      popupTarget,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      toggleMailables
    } = this.props

    const { isPaneOpen } = this.state
    const { SvgIcon } = this.context
    const buttonLabel = isPaneOpen
      ? intl.formatMessage({ id: 'components.AppMenu.closeMenu' })
      : intl.formatMessage({ id: 'components.AppMenu.openMenu' })

    return (
      <>
        <button
          aria-controls="app-menu"
          aria-expanded={isPaneOpen}
          aria-label={buttonLabel}
          className={`app-menu-icon ${isPaneOpen ? 'open' : ''}`}
          onClick={this._togglePane}
          onKeyDown={this._handleMenuButtonKeyDown}
          ref={this.appMenuButtonRef}
        >
          <span />
          <span />
          <span />
        </button>
        {/* Use a button for skipping navigation. A regular <a> element would modify the URL,
            and such change would be captured by the router without changing the focused element. */}
        <button
          className="skip-nav-button"
          onClick={this._handleSkipNavigation}
        >
          <FormattedMessage id="components.AppMenu.skipNavigation" />
        </button>
        <SlidingPane
          from="left"
          hideHeader
          isOpen={isPaneOpen}
          onAfterOpen={this._handleAfterOpen}
          onRequestClose={this._togglePane}
          shouldCloseOnEsc
          width="320px"
        >
          <div
            className="app-menu"
            id="app-menu"
            ref={this.appMenuContainerRef}
          >
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
  const { extraMenuItems } = state.otp.config
  return {
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
    extraMenuItems,
    fieldTripEnabled: isModuleEnabled(state, Modules.FIELD_TRIP),
    mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES),
    popupTarget: state.otp.config?.popups?.launchers?.sidebarLink
  }
}

const mapDispatchToProps = {
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips,
  setMainPanelContent,
  setPopupContent: uiActions.setPopupContent,
  toggleMailables: callTakerActions.toggleMailables
}

export default injectIntl(
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
  iconUrl: string
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
