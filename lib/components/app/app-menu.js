import React, { Component } from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import { connect } from 'react-redux'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router'

import Icon from '../narrative/icon'
import IconWithSpace from '../util/icon-with-space'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'
import { isModuleEnabled, Modules } from '../../util/config'

// TODO: make menu items configurable via props/config

class AppMenu extends Component {
  static propTypes = {
    setMainPanelContent: PropTypes.func
  }

  _showRouteViewer = () => {
    this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
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

  render () {
    const {
      callTakerEnabled,
      fieldTripEnabled,
      mailablesEnabled,
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      toggleMailables
    } = this.props

    return (
      <div className='app-menu'>
        <DropdownButton
          aria-label='Application Menu'
          className='app-menu-button'
          id='app-menu'
          noCaret
          title={(<Icon type='bars' />)}>
          <MenuItem onClick={this._showRouteViewer}>
            <IconWithSpace type='bus' />
            <FormattedMessage id='components.AppMenu.routeViewer' />
          </MenuItem>
          {callTakerEnabled &&
            <MenuItem onClick={resetAndToggleCallHistory}>
              <IconWithSpace type='history' />
              <FormattedMessage id='components.AppMenu.callHistory' />
            </MenuItem>
          }
          {fieldTripEnabled &&
            <MenuItem onClick={resetAndToggleFieldTrips}>
              <IconWithSpace type='graduation-cap' />
              <FormattedMessage id='components.AppMenu.fieldTrip' />
            </MenuItem>
          }
          {mailablesEnabled &&
            <MenuItem onClick={toggleMailables}>
              <IconWithSpace type='envelope' />
              <FormattedMessage id='components.AppMenu.mailables' />
            </MenuItem>
          }
          <MenuItem onClick={this._startOver}>
            <IconWithSpace type='undo' />
            <FormattedMessage id='common.forms.startOver' />
          </MenuItem>
        </DropdownButton>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppMenu))
