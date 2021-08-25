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

// TODO: make menu items configurable via props/config

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
      resetAndToggleCallHistory,
      resetAndToggleFieldTrips,
      toggleMailables
    } = this.props

    return (
      <>
        <div>
          <Icon onClick={this._expandedPane} type='bars' />
        </div>
        <SlidingPane
          closeIcon={<Icon type='close' />}
          from='left'
          isOpen={this.state.isPaneOpenLeft}
          onRequestClose={this._expandedPane}
          width='300px'>
          <MenuItem
            icon='bus'
            navTitle={languageConfig.routeViewer || 'Route Viewer'}
            onClick={this._showRouteViewer} />
          <MenuItem
            containsSubmenu
            iconUrl='https://cdn.icon-icons.com/icons2/2248/PNG/512/tools_icon_137091.png'
            navTitle='Traveler Tools'>
            <MenuItem
              containsSubmenu
              icon='bus'
              isSubmenuItem
              navTitle='Transit Tools'>
              <MenuItem
                iconUrl='https://play-lh.googleusercontent.com/7YyudRPI8a4Fbt63CwNffJxf0xa6WDM4sqwJEl_gGu6PcHdCBL0PxagnI7Ddx1ydqt89=s180-rw'
                isSubmenuItem
                navTitle='Breeze Mobile' />
            </MenuItem>
            <MenuItem
              containsSubmenu
              iconUrl='https://cdn.icon-icons.com/icons2/2248/PNG/512/tools_icon_137091.png'
              isSubmenuItem
              navTitle='Regional Mobility Tools'>
              <MenuItem
                iconUrl='https://img.icons8.com/wired/64/000000/bookmark.png'
                isSubmenuItem
                navTitle='Log My Commute' />
              <MenuItem iconUrl='https://cdn.icon-icons.com/icons2/692/PNG/512/seo-social-web-network-internet_66_icon-icons.com_61546.png'
                isSubmenuItem
                navTitle='Car Pool' />
              <MenuItem
                iconUrl='https://img.icons8.com/fluency/48/000000/peach.png'
                isSubmenuItem
                navTitle='Peach Pass' />
            </MenuItem>
            <MenuItem
              iconUrl='https://cdn.icon-icons.com/icons2/1238/PNG/512/questionmark_83826.png'
              isSubmenuItem
              navTitle='Give Us Feedback' />
          </MenuItem>
          {callTakerEnabled &&
            <MenuItem
              icon='history'
              navTitle='Call History'
              onClick={resetAndToggleCallHistory} />}
          {fieldTripEnabled &&
            <MenuItem
              icon='graduation-cap'
              navTitle='Field Trip'
              onClick={resetAndToggleFieldTrips} />}
          {mailablesEnabled &&
            <MenuItem
              icon='envelope'
              navTitle='Mailables'
              onClick={toggleMailables} />}
          <MenuItem
            icon='undo'
            navTitle='Start Over'
            onClick={this._startOver} />
        </SlidingPane>
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const {language} = state.otp.config
  return {
    callTakerEnabled: isModuleEnabled(state, Modules.CALL_TAKER),
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
