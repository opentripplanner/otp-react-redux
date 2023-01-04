import { Bus } from '@styled-icons/fa-solid/Bus'
import { ChevronDown } from '@styled-icons/fa-solid/ChevronDown'
import { ChevronUp } from '@styled-icons/fa-solid/ChevronUp'
import { connect } from 'react-redux'
import { Envelope } from '@styled-icons/fa-regular/Envelope'
import { ExternalLinkSquareAlt } from '@styled-icons/fa-solid/ExternalLinkSquareAlt'
import { FormattedMessage, injectIntl, IntlShape, useIntl } from 'react-intl'
import { GlobeAmericas } from '@styled-icons/fa-solid/GlobeAmericas'
import { GraduationCap } from '@styled-icons/fa-solid/GraduationCap'
import { History } from '@styled-icons/fa-solid/History'
import { MapMarked } from '@styled-icons/fa-solid/MapMarked'
import { MenuItem } from 'react-bootstrap'
import { Undo } from '@styled-icons/fa-solid/Undo'
import { User } from '@auth0/auth0-react'
import { withRouter } from 'react-router'
import AnimateHeight from 'react-animate-height'
import React, { Component, Fragment, useContext } from 'react'
import SlidingPane from 'react-sliding-pane'
import type { RouteComponentProps } from 'react-router'
import type { WrappedComponentProps } from 'react-intl'

import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { ComponentContext } from '../../util/contexts'
import { handleLocaleSelection } from '../../util/locale'
import { isModuleEnabled, Modules } from '../../util/config'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import { StyledIconWrapper } from '../util/styledIcon'
import startOver from '../util/start-over'

type AppMenuProps = {
  activeLocale: string
  callTakerEnabled?: boolean
  // Typescript TODO configLanguageType
  configLanguages?: Record<string, any>
  createOrUpdateUser: (user: User, silent: boolean, intl: IntlShape) => void
  extraMenuItems?: menuItem[]
  fieldTripEnabled?: boolean
  location: { search: string }
  loggedInUser: User
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
  expandedSubmenus: Record<string, boolean>
  isPaneOpen: boolean
}
type menuItem = {
  children?: menuItem[]
  href?: string
  iconType: string | JSX.Element
  iconUrl?: string
  id: string
  label: string | JSX.Element
  // TODO: find the right mouse handler type
  onClick?: any
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
    expandedSubmenus: {} as Record<string, boolean>,
    isPaneOpen: false
  }

  _showTripPlanner = () => {
    this.props.setMainPanelContent(null)
    this._togglePane()
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
          onClick,
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
                className="expansion-button-container menu-item expand-submenu-button"
                id={id}
                onSelect={() => this._toggleSubmenu(id)}
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
            className={
              subMenuDivider ? 'app-menu-divider menu-item' : 'menu-item'
            }
            href={href}
            key={id}
            onClick={onClick}
          >
            <IconAndLabel iconType={iconType} iconUrl={iconUrl} label={label} />
          </MenuItem>
        )
      })
    )
  }

  render() {
    const {
      activeLocale,
      callTakerEnabled,
      configLanguages,
      createOrUpdateUser,
      extraMenuItems,
      fieldTripEnabled,
      intl,
      loggedInUser,
      mailablesEnabled,
      popupTarget,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      setLocale,
      toggleMailables
    } = this.props

    const languageMenuItems: menuItem[] | undefined = configLanguages && [
      {
        children: Object.keys(configLanguages)
          .filter((locale) => locale !== 'allLanguages')
          .map((locale) => ({
            iconType: <svg />,
            id: configLanguages[locale].name,
            label:
              activeLocale === locale ? (
                <>
                  <strong
                    aria-label={intl.formatMessage({
                      id: 'components.SubNav.activeLanguage'
                    })}
                  >
                    {configLanguages[locale].name}
                  </strong>
                </>
              ) : (
                configLanguages[locale].name
              ),
            onClick: (e: MouseEvent) =>
              handleLocaleSelection(
                // @ts-expect-error TODO: correct this type pipeline
                e,
                locale,
                activeLocale,
                loggedInUser,
                createOrUpdateUser,
                setLocale,
                intl
              ),
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
    return (
      <>
        <div
          aria-label={
            isPaneOpen
              ? intl.formatMessage({ id: 'components.AppMenu.closeMenu' })
              : intl.formatMessage({ id: 'components.AppMenu.openMenu' })
          }
          className="app-menu-icon"
          onClick={this._togglePane}
          onKeyDown={this._togglePane}
          role="button"
          tabIndex={0}
        >
          <span className={isPaneOpen ? 'menu-left-x' : 'menu-top-line'} />
          <span className={isPaneOpen ? '' : 'menu-middle-line'} />
          <span className={isPaneOpen ? 'menu-right-x' : 'menu-bottom-line'} />
        </div>
        <SlidingPane
          from="left"
          isOpen={isPaneOpen}
          onRequestClose={this._togglePane}
          width="320px"
        >
          <nav
            aria-label={intl.formatMessage({
              id: 'components.AppMenu.appMenu'
            })}
            className="app-menu"
          >
            <ul>
              {/* This item is duplicated by the view-switcher, but only shown on mobile
            when the view switcher isn't shown (using css) */}
              <MenuItem
                className="menu-item app-menu-trip-planner-link"
                onClick={this._showTripPlanner}
              >
                <StyledIconWrapper>
                  <MapMarked />
                </StyledIconWrapper>
                <FormattedMessage id="components.BatchRoutingPanel.shortTitle" />
              </MenuItem>
              {/* This item is duplicated by the view-switcher, but only shown on mobile
            when the view switcher isn't shown (using css) */}
              <MenuItem
                className="menu-item app-menu-route-viewer-link app-menu-divider"
                onClick={this._showRouteViewer}
              >
                <StyledIconWrapper>
                  <Bus />
                </StyledIconWrapper>
                <FormattedMessage id="components.RouteViewer.shortTitle" />
              </MenuItem>
              <MenuItem className="menu-item" onClick={this._startOver}>
                <StyledIconWrapper>
                  <Undo />
                </StyledIconWrapper>
                <FormattedMessage id="common.forms.startOver" />
              </MenuItem>
              {popupTarget && (
                <MenuItem className="menu-item" onClick={this._triggerPopup}>
                  <StyledIconWrapper>
                    <SvgIcon iconName={popupTarget} />
                  </StyledIconWrapper>
                  <FormattedMessage id={`config.popups.${popupTarget}`} />
                </MenuItem>
              )}
              {callTakerEnabled && (
                <MenuItem
                  className="menu-item"
                  onClick={resetAndToggleCallHistory}
                >
                  <StyledIconWrapper>
                    <History />
                  </StyledIconWrapper>
                  <FormattedMessage id="components.AppMenu.callHistory" />
                </MenuItem>
              )}
              {fieldTripEnabled && (
                <MenuItem
                  className="menu-item"
                  onClick={resetAndToggleFieldTrips}
                >
                  <StyledIconWrapper>
                    <GraduationCap />
                  </StyledIconWrapper>
                  <FormattedMessage id="components.AppMenu.fieldTrip" />
                </MenuItem>
              )}
              {mailablesEnabled && (
                <MenuItem className="menu-item" onClick={toggleMailables}>
                  <StyledIconWrapper>
                    <Envelope />
                  </StyledIconWrapper>
                  <FormattedMessage id="components.AppMenu.mailables" />
                </MenuItem>
              )}
              {this._addExtraMenuItems([
                ...(extraMenuItems || []),
                ...(languageMenuItems || [])
              ])}
            </ul>
          </nav>
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
    loggedInUser: state.user.loggedInUser,
    mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES),
    popupTarget: state.otp.config?.popups?.launchers?.sidebarLink
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips,
  setLocale: uiActions.setLocale,
  setMainPanelContent,
  setPopupContent: uiActions.setPopupContent,
  toggleMailables: callTakerActions.toggleMailables
}

export default injectIntl(
  // @ts-expect-error TODO: type setMainPanelContent
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
  iconType: string | JSX.Element
  iconUrl?: string
  label: string | JSX.Element
}): JSX.Element => {
  const intl = useIntl()
  // FIXME: add types to context
  // @ts-expect-error No type on ComponentContext
  const { SvgIcon } = useContext(ComponentContext)

  return (
    <span>
      {/* TODO: clean up double ternary */}
      {iconUrl ? (
        <img alt="" src={iconUrl} />
      ) : iconType ? (
        typeof iconType === 'string' ? (
          <SvgIcon iconName={iconType} />
        ) : (
          iconType
        )
      ) : (
        <ExternalLinkSquareAlt />
      )}
      {label}
    </span>
  )
}
