import React, { Component } from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import { connect } from 'react-redux'
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
    const { isPaneOpenLeft } = this.state
    this.setState({ isPaneOpenLeft: !isPaneOpenLeft })
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
        <Icon name='bars' onClick={this._expandedPane} style={{ cursor: 'pointer' }} />
        <SlidingPane
          closeIcon={<Icon name='close' />}
          from='left'
          isOpen={this.state.isPaneOpenLeft}
          onRequestClose={this._expandedPane}
          width='380px'>
          <MenuItem
            iconType='bus'
            label={languageConfig.routeViewer || 'Route Viewer'}
            onClick={this._showRouteViewer}
          />
          <MenuItem
            iconType='undo'
            label='Start Over'
            onClick={this._startOver}
          />
          {callTakerEnabled &&
            <MenuItem
              iconType='history'
              label='Call History'
              onClick={resetAndToggleCallHistory} />}
          {fieldTripEnabled &&
            <MenuItem
              iconType='graduation-cap'
              label='Field Trip'
              onClick={resetAndToggleFieldTrips} />}
          {mailablesEnabled &&
            <MenuItem
              iconType='envelope'
              label='Mailables'
              onClick={toggleMailables} />}
          {extraMenuItems && (
            extraMenuItems.map((menuItem) => {
              const {
                containsSubmenu,
                extraSubMenuItems,
                href,
                iconType,
                iconurl,
                id,
                isSubmenuItem,
                label
              } = menuItem
              return (
                <MenuItem
                  containsSubmenu={containsSubmenu}
                  iconType={iconType && iconType}
                  iconurl={iconurl && iconurl}
                  isSubmenuItem={isSubmenuItem}
                  key={id}
                  label={label}
                  url={href && href}
                >
                  {containsSubmenu &&
                    extraSubMenuItems && (
                    extraSubMenuItems.map((subMenuItem) => {
                      const {
                        containsSubmenu,
                        extraSubMenuItems,
                        href,
                        iconType,
                        iconurl,
                        id,
                        label
                      } = subMenuItem
                      return (
                        <MenuItem
                          containsSubmenu={containsSubmenu === 'true'}
                          iconType={iconType && iconType}
                          iconurl={iconurl && iconurl}
                          isSubmenuItem
                          key={id}
                          label={label}
                          url={href && href}
                        >
                          {containsSubmenu === 'true' && (
                            extraSubMenuItems.map((subMenuItem) => {
                              const {
                                containsSubmenu,
                                href,
                                iconType,
                                iconurl,
                                id,
                                label
                              } = subMenuItem
                              return (
                                <MenuItem
                                  containsSubmenu={containsSubmenu === 'true'}
                                  iconType={iconType && iconType}
                                  iconurl={iconurl && iconurl}
                                  isSubmenuItem
                                  key={id}
                                  label={label}
                                  url={href && href} />
                              )
                            })
                          )}
                        </MenuItem>
                      )
                    })
                  )}
                </MenuItem>
              )
            }
            ))}
        </SlidingPane>
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const {language} = state.otp.config
  const {extraMenuItems} = state.otp.config
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
