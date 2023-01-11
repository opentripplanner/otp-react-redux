import { Bus } from '@styled-icons/fa-solid/Bus'
import { ChevronDown } from '@styled-icons/fa-solid/ChevronDown'
import { ChevronUp } from '@styled-icons/fa-solid/ChevronUp'
import { connect } from 'react-redux'
import { Envelope } from '@styled-icons/fa-regular/Envelope'
import { ExternalLinkSquareAlt } from '@styled-icons/fa-solid/ExternalLinkSquareAlt'
import { FormattedMessage, injectIntl, useIntl } from 'react-intl'
import { GraduationCap } from '@styled-icons/fa-solid/GraduationCap'
import { History } from '@styled-icons/fa-solid/History'
import { Undo } from '@styled-icons/fa-solid/Undo'
import { withRouter } from 'react-router'
import AnimateHeight from 'react-animate-height'
import React, { Component, Fragment, HTMLAttributes, useContext } from 'react'
import SlidingPane from 'react-sliding-pane'
import type { RouteComponentProps } from 'react-router'
import type { WrappedComponentProps } from 'react-intl'

import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import { isModuleEnabled, Modules } from '../../util/config'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import { StyledIconWrapper } from '../util/styledIcon'
import startOver from '../util/start-over'

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
  expandedSubmenus: Record<string, boolean>
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
interface MenuItemProps extends HTMLAttributes<HTMLElement> {
  href?: string
}

const MenuItem = (props: MenuItemProps) => {
  const Comp = props.href ? 'a' : 'button'
  return <Comp {...props} />
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
    expandedSubmenus: {} as Record<string, boolean>,
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

  _toggleSubmenu = (id: string) => {
    const { expandedSubmenus } = this.state
    const currentlyOpen = expandedSubmenus[id] || false
    this.setState({ expandedSubmenus: { [id]: !currentlyOpen } })
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
        const { expandedSubmenus } = this.state
        const { intl } = this.props
        const isSubmenuExpanded = expandedSubmenus?.[id]

        const localizationId = `config.menuItems.${id}`
        const localizedLabel = intl.formatMessage({ id: localizationId })
        // Override the config label if a localized label exists
        const label =
          localizedLabel === localizationId ? configLabel : localizedLabel

        if (children) {
          return (
            <Fragment key={id}>
              <MenuItem
                className="expand-submenu-button"
                // TODO: add aria-expanded etc.
                onClick={() => this._toggleSubmenu(id)}
              >
                <IconAndLabel
                  iconType={iconType}
                  iconUrl={iconUrl}
                  label={label}
                />
                <StyledIconWrapper className="expand-menu-chevron">
                  {isSubmenuExpanded ? <ChevronUp /> : <ChevronDown />}
                </StyledIconWrapper>
              </MenuItem>
              <AnimateHeight
                duration={500}
                height={isSubmenuExpanded ? 'auto' : 0}
              >
                <div className="sub-menu-container">
                  {this._addExtraMenuItems(children)}
                </div>
              </AnimateHeight>
            </Fragment>
          )
        }

        return (
          <MenuItem
            className={subMenuDivider ? 'app-menu-divider' : ''}
            href={href}
            key={id}
          >
            <IconAndLabel iconType={iconType} iconUrl={iconUrl} label={label} />
          </MenuItem>
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
          aria-label={buttonLabel}
          // TODO: add aria-expanded?
          className={`app-menu-icon ${isPaneOpen ? 'open' : ''}`}
          onClick={this._togglePane}
          title={buttonLabel}
        >
          <span />
          <span />
          <span />
        </button>
        <SlidingPane
          from="left"
          hideHeader
          isOpen={isPaneOpen}
          onRequestClose={this._togglePane}
          shouldCloseOnEsc
          title="App menu" // TODO: i18n
          width="320px"
        >
          <div className="app-menu">
            {/* This item is duplicated by the view-switcher, but only shown on mobile
            when the view switcher isn't shown (using css) */}
            <MenuItem
              className="app-menu-route-viewer-link"
              onClick={this._showRouteViewer}
            >
              <StyledIconWrapper>
                <Bus />
              </StyledIconWrapper>
              <FormattedMessage id="components.RouteViewer.shortTitle" />
            </MenuItem>
            <MenuItem onClick={this._startOver}>
              <StyledIconWrapper>
                <Undo />
              </StyledIconWrapper>
              <FormattedMessage id="common.forms.startOver" />
            </MenuItem>
            {popupTarget && (
              <MenuItem onClick={this._triggerPopup}>
                <StyledIconWrapper>
                  <SvgIcon iconName={popupTarget} />
                </StyledIconWrapper>
                <FormattedMessage id={`config.popups.${popupTarget}`} />
              </MenuItem>
            )}
            {callTakerEnabled && (
              <MenuItem onClick={resetAndToggleCallHistory}>
                <StyledIconWrapper>
                  <History />
                </StyledIconWrapper>
                <FormattedMessage id="components.AppMenu.callHistory" />
              </MenuItem>
            )}
            {fieldTripEnabled && (
              <MenuItem onClick={resetAndToggleFieldTrips}>
                <StyledIconWrapper>
                  <GraduationCap />
                </StyledIconWrapper>
                <FormattedMessage id="components.AppMenu.fieldTrip" />
              </MenuItem>
            )}
            {mailablesEnabled && (
              <MenuItem onClick={toggleMailables}>
                <StyledIconWrapper>
                  <Envelope />
                </StyledIconWrapper>
                <FormattedMessage id="components.AppMenu.mailables" />
              </MenuItem>
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
const IconAndLabel = ({
  iconType,
  iconUrl,
  label
}: {
  iconType: string
  iconUrl: string
  label: string
}): JSX.Element => {
  const intl = useIntl()
  // FIXME: add types to context
  // @ts-expect-error No type on ComponentContext
  const { SvgIcon } = useContext(ComponentContext)

  return (
    <span>
      {/* TODO: clean up double ternary */}
      {iconUrl ? (
        <img
          alt={intl.formatMessage(
            {
              id: 'components.AppMenu.menuItemIconAlt'
            },
            { label }
          )}
          src={iconUrl}
        />
      ) : iconType ? (
        <SvgIcon iconName={iconType} />
      ) : (
        <ExternalLinkSquareAlt />
      )}
      {label}
    </span>
  )
}
