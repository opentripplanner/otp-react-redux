import React, { Component } from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import { connect } from 'react-redux'
// import { DropdownButton, MenuItem } from 'react-bootstrap'
import { withRouter } from 'react-router'
import SlidingPane from 'react-sliding-pane'

import Icon from '../narrative/icon'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import { isModuleEnabled, Modules } from '../../util/config'

import { MenuItem } from './menu-item'

class AppMenu extends Component {
  static propTypes = {
    setMainPanelContent: PropTypes.func
  }

  state = {
    isChevronUp: false,
    isMenuExpanded: false,
    isPaneOpenLeft: false
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
    const expanded = this.state.isPaneOpenLeft
    this.setState({ isPaneOpenLeft: !expanded })
  }

  render () {
    const {
      callTakerEnabled,
      fieldTripEnabled,
      languageConfig,
      mailablesEnabled,
      menuItems,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      toggleMailables
    } = this.props

    return (
      <>
        <Icon name='bars' onClick={this._expandedPane} />
        <SlidingPane
          closeIcon={<Icon name='close' />}
          from='left'
          isOpen={this.state.isPaneOpenLeft}
          onRequestClose={this._expandedPane}
          width='300px'>
          <MenuItem
            label={languageConfig.routeViewer || 'Route Viewer'}
            name='bus'
            onClick={this._showRouteViewer}
          />
          <MenuItem
            label='Start Over'
            name='undo'
            onClick={this._startOver}
          />
          {callTakerEnabled &&
            <MenuItem
              label='Call History'
              name='history'
              onClick={resetAndToggleCallHistory} />}
          {fieldTripEnabled &&
            <MenuItem
              label='Field Trip'
              name='graduation-cap'
              onClick={resetAndToggleFieldTrips} />}
          {mailablesEnabled &&
            <MenuItem
              label='Mailables'
              name='envelope'
              onClick={toggleMailables} />}
          {menuItems && (
            menuItems.map((menuItem) => (
              <MenuItem
                containsSubmenu={menuItem.containsSubmenu}
                iconurl={menuItem.iconUrl && menuItem.iconUrl}
                isSubmenu={menuItem.isSubmenu}
                key={menuItem.id}
                label={menuItem.label}
                name={menuItem.iconType && menuItem.iconType}
                url={menuItem.href && menuItem.href}
              >
                {menuItem.containsSubmenu &&
                  menuItem.items && (
                  menuItem.items.map((subMenuItem) => (
                    <MenuItem
                      containsSubmenu={subMenuItem.containsSubmenu === 'true'}
                      iconurl={subMenuItem.iconUrl && subMenuItem.iconUrl}
                      isSubmenuItem
                      key={subMenuItem.id}
                      label={subMenuItem.label}
                      name={subMenuItem.iconType && subMenuItem.iconType}
                      url={subMenuItem.href}
                    >
                      {subMenuItem.containsSubmenu === 'true' && (
                        subMenuItem.items.map((subMenuItem) => (
                          <MenuItem
                            containsSubmenu={subMenuItem.containsSubmenu === 'true'}
                            iconurl={subMenuItem.iconUrl && subMenuItem.iconUrl}
                            isSubmenuItem
                            key={subMenuItem.id}
                            label={subMenuItem.label}
                            name={subMenuItem.iconType && subMenuItem.iconType}
                            url={subMenuItem.href} />
                        ))
                      )}
                    </MenuItem>
                  ))
                )}
              </MenuItem>
            ))
          )}
        </SlidingPane>
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const {language} = state.otp.config
  const {menuItems} = state.otp.config
  return {
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
    fieldTripEnabled: isModuleEnabled(state, Modules.FIELD_TRIP),
    languageConfig: language,
    mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES),
    menuItems
  }
}

const mapDispatchToProps = {
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  resetAndToggleFieldTrips: fieldTripActions.resetAndToggleFieldTrips,
  setMainPanelContent,
  toggleMailables: callTakerActions.toggleMailables
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppMenu))
