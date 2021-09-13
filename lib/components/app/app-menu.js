import React, { Component } from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import SlidingPane from 'react-sliding-pane'
import { MenuItem } from 'react-bootstrap'
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group'

import Icon from '../narrative/icon'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import { isModuleEnabled, Modules } from '../../util/config'

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
    this._expandPane()
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
        startOverUrl += `?${qs.stringify({sessionId})}`
      }
    }
    window.location.href = startOverUrl
  }

  _expandPane = () => {
    const { isPaneOpen } = this.state
    this.setState({ isPaneOpen: !isPaneOpen })
  }

  _expandSubmenu = (id) => {
    const { expandedSubmenus } = this.state
    const currentlyOpen = expandedSubmenus[id] || false
    this.setState({ expandedSubmenus: { [id]: !currentlyOpen } })
  }

  _addExtraMenuItems = (menuItems) => {
    const AddIconAndLabel = ({iconType, iconUrl, label}) => {
      return (
        iconUrl
          ? <span>
            <img alt={`Icon for ${label} menu item`} src={iconUrl} />
            {label}
          </span>
          : <span><Icon name={iconType || 'external-link-square'} />{label}</span>
      )
    }

    return (
      menuItems && menuItems.map(menuItem => {
        const {
          children,
          href,
          iconType,
          iconUrl,
          id,
          label,
          subMenuDivider
        } = menuItem
        const { expandedSubmenus } = this.state
        const isSubmenuExpanded = expandedSubmenus[id]

        if (children) {
          return <>
            <MenuItem
              className='expansion-button-container menu-item'
              header
              key={id}>
              <button
                className='expand-submenu-button'
                onClick={() => this._expandSubmenu(id)}
              >
                <AddIconAndLabel
                  iconType={iconType}
                  iconUrl={iconUrl}
                  label={label} />
                <span>
                  <Icon
                    className='expand-menu-chevron'
                    name={`chevron-${isSubmenuExpanded ? 'up' : 'down'}`} />
                </span>
              </button>
            </MenuItem>
            <VelocityTransitionGroup
              enter={{ animation: 'slideDown' }}
              leave={{ animation: 'slideUp' }}>
              {isSubmenuExpanded && (
                <div className='sub-menu-container'>
                  {this._addExtraMenuItems(children)}
                </div>
              )}
            </VelocityTransitionGroup>
          </>
        }

        return <MenuItem
          className={subMenuDivider ? 'app-menu-divider menu-item' : 'menu-item'}
          href={href || ''}
          key={id}>
          <AddIconAndLabel
            iconType={iconType}
            iconUrl={iconUrl}
            label={label} />
        </MenuItem>
      })
    )
  }

  render () {
    const {
      callTakerEnabled,
      extraMenuItems,
      fieldTripEnabled,
      languageConfig,
      mailablesEnabled,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      toggleMailables
    } = this.props

    const { isPaneOpen } = this.state
    return (
      <>
        <div
          aria-label={isPaneOpen ? 'Close Menu' : 'Open Menu'}
          className='app-menu-icon'
          onClick={this._expandPane}
          onKeyDown={this._expandPane}
          role='button'
          tabIndex={0}>
          <span className={isPaneOpen ? 'menu-left-x' : 'menu-top-line'} />
          <span className={isPaneOpen ? '' : 'menu-middle-line'} />
          <span className={isPaneOpen ? 'menu-right-x' : 'menu-bottom-line'} />
        </div>
        <SlidingPane
          from='left'
          isOpen={isPaneOpen}
          onRequestClose={this._expandPane}
          width='320px'>
          <ul className='app-menu'>
            <MenuItem
              className='menu-item'
              onClick={this._showRouteViewer}>
              <Icon name='bus' />{languageConfig.routeViewer || 'Route Viewer'}
            </MenuItem>
            <MenuItem
              className='menu-item'
              onClick={this._startOver}>
              <Icon name='undo' />Start Over
            </MenuItem>
            {callTakerEnabled &&
            <MenuItem
              className='menu-item'
              onClick={resetAndToggleCallHistory}>
              <Icon name='history' />Call History
            </MenuItem>}
            {fieldTripEnabled &&
            <MenuItem
              className='menu-item'
              onClick={resetAndToggleFieldTrips}>
              <Icon name='' />Field Trip
            </MenuItem>}
            {mailablesEnabled &&
            <MenuItem
              className='menu-item'
              onClick={toggleMailables}>
              <Icon name='' />Mailables
            </MenuItem>}
            {this._addExtraMenuItems(extraMenuItems)}
          </ul>
        </SlidingPane>
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const {extraMenuItems, language} = state.otp.config
  return {
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
    extraMenuItems,
    fieldTripEnabled: isModuleEnabled(state, Modules.FIELD_TRIP),
    languageConfig: language,
    mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES)
  }
}

const mapDispatchToProps = {
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips,
  setMainPanelContent,
  toggleMailables: callTakerActions.toggleMailables
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppMenu))
