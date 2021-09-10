import React, { Component } from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import SlidingPane from 'react-sliding-pane'
import { MenuItem } from 'react-bootstrap'
import VelocityTransitionGroup from 'velocity-react/velocity-transition-group'

import * as callTakerActions from '../../actions/call-taker'
import Icon from '../narrative/icon'
import * as fieldTripActions from '../../actions/field-trip'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import { isModuleEnabled, Modules } from '../../util/config'

class AppMenu extends Component {
  static propTypes = {
    setMainPanelContent: PropTypes.func
  }

  state = {
    isPaneOpenLeft: false,
    isSubmenuExpanded: false
  }

  _showRouteViewer = () => {
    this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
    this._expandedPane()
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

  _expandedPane = () => {
    const { isPaneOpenLeft } = this.state
    this.setState({ isPaneOpenLeft: !isPaneOpenLeft })
  }

  _expandSubmenu = () => {
    const { isSubmenuExpanded } = this.state
    this.setState({ isSubmenuExpanded: !isSubmenuExpanded })
  }

  _addExtraMenuItems = (menuItems) => {
    const AddIconAndLabel = ({iconType, iconUrl, label}) => {
      return (
        iconUrl
          ? <span>
            <img alt={`icon for ${label} Menu Item`} src={iconUrl} />
            {label}
          </span>
          : <span><Icon name={iconType || 'car'} />{label}</span>
      )
    }

    return (
      menuItems.map(menuItem => {
        const {
          children,
          containsChildren,
          href,
          iconType,
          iconUrl,
          id,
          label,
          subMenuDivider
        } = menuItem
        return (
          containsChildren
            ? <>
              <MenuItem
                className='expansion-button-container menu-item'
                header
                key={id}>
                <button
                  className='expand-submenu-button'
                  onClick={this._expandSubmenu}>
                  <AddIconAndLabel
                    iconType={iconType}
                    iconUrl={iconUrl}
                    label={label} />
                  <span>
                    <Icon
                      className='expand-menu-chevron'
                      name={`chevron-${this.state.isSubmenuExpanded ? 'up' : 'down'}`} />
                  </span>
                </button>
              </MenuItem>
              <VelocityTransitionGroup
                duration={50}
                easing='linear'
                enter={{ animation: 'slideDown' }}
                leave={{ animation: 'slideUp' }}>
                {this.state.isSubmenuExpanded && (
                  <div className='sub-menu-container'>
                    {this._addExtraMenuItems(children)}
                  </div>
                )}
              </VelocityTransitionGroup>
            </>
            : <MenuItem
              className={subMenuDivider ? 'app-menu-divider menu-item' : 'menu-item'}
              eventKey={href ? 1 : ''}
              href={href || ''}
              key={id}>
              <AddIconAndLabel
                iconType={iconType}
                iconUrl={iconUrl}
                label={label} />
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
      languageConfig,
      mailablesEnabled,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      toggleMailables
    } = this.props

    return (
      <>
        <div
          aria-label={this.state.isPaneOpenLeft ? 'Close Menu' : 'Open Menu'}
          class='app-menu-icon'
          onClick={this._expandedPane}
          onKeyDown={this._expandedPane}
          role='button'
          tabIndex={0}>
          <span className={this.state.isPaneOpenLeft ? 'menu-left-x' : 'menu-top-line'} />
          <span className={this.state.isPaneOpenLeft ? '' : 'menu-middle-line'} />
          <span className={this.state.isPaneOpenLeft ? 'menu-right-x' : 'menu-bottom-line'} />
        </div>
        <SlidingPane
          from='left'
          isOpen={this.state.isPaneOpenLeft}
          onRequestClose={this._expandedPane}
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
            {extraMenuItems && this._addExtraMenuItems(extraMenuItems)}
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
