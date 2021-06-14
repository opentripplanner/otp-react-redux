import React, { Component } from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import { connect } from 'react-redux'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { withRouter } from 'react-router'

import Icon from '../narrative/icon'

import * as callTakerActions from '../../actions/call-taker'
import { MainPanelContent, setMainPanelContent } from '../../actions/ui'

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

  _toggleMailables = () => this.props.toggleMailables()

  render () {
    const { languageConfig, mailablesEnabled } = this.props

    return (
      <div className='app-menu'>
        <DropdownButton
          aria-label='Application Menu'
          title={(<Icon type='bars' />)}
          noCaret
          className='app-menu-button'
          id='app-menu'>
          <MenuItem onClick={this._showRouteViewer}>
            <Icon type='bus' /> {languageConfig.routeViewer || 'Route Viewer'}
          </MenuItem>
          {mailablesEnabled &&
            <MenuItem onClick={this._toggleMailables}>
              <Icon type='envelope' /> Mailables
            </MenuItem>
          }
          <MenuItem onClick={this._startOver}>
            <Icon type='undo' /> Start Over
          </MenuItem>
        </DropdownButton>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const {language, modules} = state.otp.config
  return {
    languageConfig: language,
    mailablesEnabled: Boolean(modules?.find(m => m.id === 'mailables'))
  }
}

const mapDispatchToProps = {
  setMainPanelContent,
  toggleMailables: callTakerActions.toggleMailables
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppMenu))
