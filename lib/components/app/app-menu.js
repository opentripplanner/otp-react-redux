import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { MenuItem } from 'react-bootstrap'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import qs from 'qs'
import SlidingPane from 'react-sliding-pane'
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group'

import { isModuleEnabled, Modules } from '../../util/config'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import Icon from '../util/icon'

/**
 * Sidebar which appears to show user list of options and links
 */
class AppMenu extends Component {
  static propTypes = {
    setMainPanelContent: PropTypes.func
  }

  state = {
    expandedSubmenus: {},
    isPaneOpen: false
  }

  _showRouteViewer = () => {
    this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
    this._togglePane()
  }

  _startOver = () => {
    const { location, reactRouterConfig } = this.props
    const { search } = location
    let startOverUrl = '/'
    if (reactRouterConfig && reactRouterConfig.basename) {
      startOverUrl += reactRouterConfig.basename
    }
    // If search contains sessionId, preserve this so that the current session
    // is not lost when the page reloads.
    if (search) {
      const params = qs.parse(search, { ignoreQueryPrefix: true })
      const { sessionId } = params
      if (sessionId) {
        startOverUrl += `?${qs.stringify({ sessionId })}`
      }
    }
    window.location.href = startOverUrl
  }

  _togglePane = () => {
    const { isPaneOpen } = this.state
    this.setState({ isPaneOpen: !isPaneOpen })
  }

  _toggleSubmenu = (id) => {
    const { expandedSubmenus } = this.state
    const currentlyOpen = expandedSubmenus[id] || false
    this.setState({ expandedSubmenus: { [id]: !currentlyOpen } })
  }

  _addExtraMenuItems = (menuItems) => {
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
        const isSubmenuExpanded = expandedSubmenus[id]

        const localizationId = `config.menuItems.${id}`
        const localizedLabel = intl.formatMessage({id: localizationId})
        // Override the config label if a localized label exists
        const label = localizedLabel === localizationId ? configLabel : localizedLabel

        if (children) {
          return (
            <Fragment key={id}>
              <MenuItem
                className='expansion-button-container menu-item expand-submenu-button'
                onSelect={() => this._toggleSubmenu(id)}
              >
                <IconAndLabel
                  iconType={iconType}
                  iconUrl={iconUrl}
                  label={label}
                />
                <span>
                  <Icon
                    className='expand-menu-chevron'
                    type={`chevron-${isSubmenuExpanded ? 'up' : 'down'}`}
                  />
                </span>
              </MenuItem>
              <VelocityTransitionGroup
                enter={{ animation: 'slideDown' }}
                leave={{ animation: 'slideUp' }}
              >
                {isSubmenuExpanded && (
                  <div className='sub-menu-container'>
                    {this._addExtraMenuItems(children)}
                  </div>
                )}
              </VelocityTransitionGroup>
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
          >
            <IconAndLabel iconType={iconType} iconUrl={iconUrl} label={label} />
          </MenuItem>
        )
      })
    )
  }

  render () {
    const {
      callTakerEnabled,
      extraMenuItems,
      fieldTripEnabled,
      intl,
      mailablesEnabled,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      toggleMailables
    } = this.props

    const { isPaneOpen } = this.state
    return (
      <>
        <div
          aria-label={
            isPaneOpen
              ? intl.formatMessage({ id: 'components.AppMenu.closeMenu' })
              : intl.formatMessage({ id: 'components.AppMenu.openMenu' })
          }
          className='app-menu-icon'
          onClick={this._togglePane}
          onKeyDown={this._togglePane}
          role='button'
          tabIndex={0}
        >
          <span className={isPaneOpen ? 'menu-left-x' : 'menu-top-line'} />
          <span className={isPaneOpen ? '' : 'menu-middle-line'} />
          <span className={isPaneOpen ? 'menu-right-x' : 'menu-bottom-line'} />
        </div>
        <SlidingPane
          from='left'
          isOpen={isPaneOpen}
          onRequestClose={this._togglePane}
          width='320px'
        >
          <ul className='app-menu'>
            <MenuItem className='menu-item' onClick={this._showRouteViewer}>
              <Icon name='bus' />
              Route Viewer
            </MenuItem>
            <MenuItem className='menu-item' onClick={this._startOver}>
              <Icon name='undo' />
              Start Over
            </MenuItem>
            {callTakerEnabled && (
              <MenuItem
                className='menu-item'
                onClick={resetAndToggleCallHistory}
              >
                <Icon name='history' />
                Call History
              </MenuItem>
            )}
            {fieldTripEnabled && (
              <MenuItem
                className='menu-item'
                onClick={resetAndToggleFieldTrips}
              >
                <Icon name='graduation-cap' />
                Field Trip
              </MenuItem>
            )}
            {mailablesEnabled && (
              <MenuItem className='menu-item' onClick={toggleMailables}>
                <Icon name='envelope-o' />
                Mailables
              </MenuItem>
            )}
            {this._addExtraMenuItems(extraMenuItems)}
          </ul>
        </SlidingPane>
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { extraMenuItems } = state.otp.config
  return {
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
    extraMenuItems,
    fieldTripEnabled: isModuleEnabled(state, Modules.FIELD_TRIP),
    mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES)
  }
}

const mapDispatchToProps = {
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips,
  setMainPanelContent,
  toggleMailables: callTakerActions.toggleMailables
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(AppMenu))
)

/**
 * Renders a label and icon either from url or font awesome type
 */
const IconAndLabel = injectIntl(({ iconType, iconUrl, intl, label }) => {
  return (
    <span>
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
      ) : (
        <Icon name={iconType || 'external-link-square'} />
      )}
      {label}
    </span>
  )
})
