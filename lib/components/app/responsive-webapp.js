import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { setAutoPlan, setMapCenter } from '../../actions/config'
import { setLocationToCurrent } from '../../actions/map'
import { getCurrentPosition } from '../../actions/location'
import { findNearbyStops } from '../../actions/api'
import { formChanged } from '../../actions/form'
import {
  MobileScreens,
  setMobileScreen,
  clearViewedStop,
  clearViewedTrip,
  setViewedRoute,
  setMainPanelContent
} from '../../actions/ui'

class ResponsiveWebapp extends Component {
  static propTypes = {
    browser: PropTypes.object,
    desktopView: PropTypes.element,
    mobileView: PropTypes.element,
    query: PropTypes.object
  }

  _isMobile () {
    // old test: return this.props.browser.mediaType === 'extraSmall'
    // TODO: consider using 3rd-party library. Do we still need 'browser' props in state?
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /** Lifecycle methods **/

  componentWillReceiveProps (nextProps) {
    // check if device position changed (typically only set once, on initial page load)
    if (this.props.currentPosition !== nextProps.currentPosition) {
      if (nextProps.currentPosition.error || !nextProps.currentPosition.coords) return
      const pt = {
        lat: nextProps.currentPosition.coords.latitude,
        lon: nextProps.currentPosition.coords.longitude
      }

      // update nearby stops
      this.props.findNearbyStops(pt)

      // if in mobile mode and from field is not set, use current location as from and recenter map
      if (this._isMobile() && this.props.query.from === null) {
        this.props.setLocationToCurrent({ type: 'from' })
        this.props.setMapCenter(pt)
      }
    }

    // check for change to from/to locations; clear active viewer if applicable
    const thisFrom = this.props.query ? this.props.query.from : null
    const thisTo = this.props.query ? this.props.query.to : null
    const nextFrom = this.props.query ? nextProps.query.from : null
    const nextTo = this.props.query ? nextProps.query.to : null
    if (thisFrom !== nextFrom || thisTo !== nextTo) {
      // TODO: refactor / make this more consistent
      this.props.clearViewedStop()
      this.props.clearViewedTrip()
      this.props.setViewedRoute(null)
      this.props.setMainPanelContent(null)

      // update mobile state if needed
      if (this._isMobile() && nextProps.mobileScreen === MobileScreens.RESULTS_SUMMARY) {
        this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
      }
    }
  }

  componentDidMount () {
    this._newMediaType(null, true)

    if (this._isMobile()) {
      // If on mobile browser, check position on load
      this.props.getCurrentPosition()
    }

    // if from & to locations are pre-populated, attempt to plan trip on page load
    if (this.props.query.from && this.props.query.to) {
      this.props.formChanged()
    }
  }

  /** Internal methods **/

  // called when switching between desktop and mobile modes
  _newMediaType (props, initialPageLoad) {
    props = props || this.props
    if (this._isMobile()) { // entering mobile mode
      props.setAutoPlan({ autoPlan: false })
    } else { // entering desktop mode
      props.setAutoPlan({ autoPlan: true })
    }
  }

  render () {
    const { desktopView, mobileView } = this.props
    return this._isMobile() ? mobileView : desktopView
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    browser: state.browser,
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    mobileScreen: state.otp.ui.mobileScreen
  }
}

const mapDispatchToProps = {
  setAutoPlan,
  setLocationToCurrent,
  setMapCenter,
  findNearbyStops,
  getCurrentPosition,
  formChanged,
  clearViewedStop,
  clearViewedTrip,
  setViewedRoute,
  setMainPanelContent,
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp)
