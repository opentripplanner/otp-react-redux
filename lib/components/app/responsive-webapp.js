import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqual from 'lodash.isequal'
import {
  HashRouter as Router,
  Route,
  withRouter
} from 'react-router-dom'
import qs from 'qs'

import PrintLayout from './print-layout'
import { setAutoPlan, setMapCenter, setMapZoom } from '../../actions/config'
import { setLocationToCurrent } from '../../actions/map'
import { getCurrentPosition, receivedPositionResponse } from '../../actions/location'
import { findNearbyStops, findRoute } from '../../actions/api'
import { formChanged, parseUrlQueryString, setQueryParam } from '../../actions/form'
import {
  MobileScreens,
  MainPanelContent,
  setMobileScreen,
  clearViewedStop,
  clearViewedTrip,
  setViewedRoute,
  setMainPanelContent
} from '../../actions/ui'
import {
  ensureSingleAccessMode,
  getUiUrlParams,
  updateUiUrlParams
} from '../../util/query'
import { isMobile } from '../../util/ui'
import { hasTransit, isTransit, hasCar } from '../../util/itinerary'
import { getActiveItinerary } from '../../util/state'

class ResponsiveWebapp extends Component {
  static propTypes = {
    desktopView: PropTypes.element,
    initZoomOnLocate: PropTypes.number,
    mobileView: PropTypes.element,
    query: PropTypes.object
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
      // this.props.findNearbyStops(pt)

      // if in mobile mode and from field is not set, use current location as from and recenter map
      if (isMobile() && this.props.query.from === null) {
        this.props.setLocationToCurrent({ type: 'from' })
        this.props.setMapCenter(pt)
        if (this.props.initZoomOnLocate) {
          this.props.setMapZoom({zoom: this.props.initZoomOnLocate})
        }
      }
    }

    // check for change to from/to locations; clear active viewer if applicable
    const {query} = this.props
    const thisFrom = query ? query.from : null
    const thisTo = query ? query.to : null
    const nextFrom = query ? nextProps.query.from : null
    const nextTo = query ? nextProps.query.to : null
    if (thisFrom !== nextFrom || thisTo !== nextTo) {
      // TODO: refactor / make this more consistent
      this.props.clearViewedStop()
      this.props.clearViewedTrip()
      this.props.setViewedRoute(null)
      this.props.setMainPanelContent(null)

      // update mobile state if needed
      if (isMobile() && nextProps.mobileScreen === MobileScreens.RESULTS_SUMMARY) {
        this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
      }
    }

    // Check for change between ITINERARY and PROFILE routingTypes
    if (query.routingType !== nextProps.query.routingType) {
      let queryModes = nextProps.query.mode.split(',')
      // If we are entering 'ITINERARY' mode, ensure that one and only one access mode is selected
      if (nextProps.query.routingType === 'ITINERARY') {
        queryModes = ensureSingleAccessMode(queryModes)
        this.props.setQueryParam({ mode: queryModes.join(',') })
      }
      // If we are entering 'PROFILE' mode, ensure that CAR_HAIL is not selected
      // TODO: make this more generic, i.e. introduce concept of mode->routingType permissions
      if (nextProps.query.routingType === 'ITINERARY') {
        queryModes = queryModes.filter(mode => mode !== 'CAR_HAIL')
        this.props.setQueryParam({ mode: queryModes.join(',') })
      }
    }

    if (isMobile() && !this.props.activeItinerary && nextProps.activeItinerary) {
      this.props.setMobileScreen(MobileScreens.RESULTS_SUMMARY)
    }

    // Ensure that driving modes are never selected alone
    /*if (
      query.mode !== nextProps.query.mode &&
      hasCar(nextProps.query.mode) &&
      !hasTransit(nextProps.query.mode) &&
      this.props.modeGroups
    ) {
      let newMode = nextProps.query.mode
      this.props.modeGroups.forEach(modeGroup => {
        modeGroup.modes.forEach(mode => {
          const modeStr = mode.mode || mode
          if (isTransit(modeStr)) newMode += ',' + modeStr
        })
      })
      this.props.setQueryParam({ mode: newMode })
    }*/

    // Check for any updates to tracked UI state properties and update URL as needed
    if (!isEqual(this.props.uiUrlParams, nextProps.uiUrlParams)) {
      updateUiUrlParams(nextProps.uiUrlParams)
    }
  }

  componentDidMount () {
    const { location, initialDisplay } = this.props
    if (location && location.search) {
      // Set search params and plan trip if routing enabled and a query exists
      // in the URL.
      this.props.parseUrlQueryString(location.search)
    }
    this._newMediaType(null, true)

    if (isMobile()) {
      // If on mobile browser, check position on load
      this.props.getCurrentPosition()

      // Also, watch for changes in position on mobile
      navigator.geolocation.watchPosition(
        // On success
        position => { this.props.receivedPositionResponse({ position }) },
        // On error
        error => { console.log('error in watchPosition', error) },
        // Options
        { enableHighAccuracy: true }
      )
    }

    // if from & to locations are pre-populated, attempt to plan trip on page load
    if (this.props.query.from && this.props.query.to) {
      this.props.formChanged()
    }

    // Check for initial display state
    if (initialDisplay === 'route' && location.search) {
      const params = qs.parse(location.search.substring(1))
      this.props.setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
      if (params.id) {
        this.props.findRoute({ routeId: params.id })
        this.props.setViewedRoute({ routeId: params.id })
      }
    }
  }

  /** Internal methods **/

  // called when switching between desktop and mobile modes
  _newMediaType (props, initialPageLoad) {
    props = props || this.props
    if (isMobile()) { // entering mobile mode
      props.setAutoPlan({ autoPlan: false })
    } else { // entering desktop mode
      props.setAutoPlan({ autoPlan: true })
    }
  }

  render () {
    const { desktopView, mobileView } = this.props
    return isMobile() ? mobileView : desktopView
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    activeItinerary: getActiveItinerary(state.otp),
    uiUrlParams: getUiUrlParams(state.otp),
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    mobileScreen: state.otp.ui.mobileScreen,
    initZoomOnLocate: state.otp.config.map && state.otp.config.map.initZoomOnLocate,
    modeGroups: state.otp.config.modeGroups
  }
}

const mapDispatchToProps = {
  setAutoPlan,
  setLocationToCurrent,
  setMapCenter,
  setMapZoom,
  findNearbyStops,
  getCurrentPosition,
  findRoute,
  formChanged,
  clearViewedStop,
  clearViewedTrip,
  receivedPositionResponse,
  setViewedRoute,
  setMainPanelContent,
  setMobileScreen,
  setQueryParam,
  parseUrlQueryString
}

const WebappWithRouter = withRouter(connect(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp))

class RouterWrapper extends Component {
  render () {
    const { routerConfig } = this.props
    return (
      <Router basename={routerConfig && routerConfig.basename}
        hashType='slash'
        // TODO: Use react-router-redux once it is out of beta?
        // history={history}
        >
        <div>
          <Route
            exact
            path='/'
            component={() => <WebappWithRouter {...this.props} />}
            />
          <Route
            exact
            path='/route'
            component={() => <WebappWithRouter initialDisplay='route' {...this.props} />}
            />
          <Route
            path='/print'
            component={PrintLayout}
            />
          {/*
          <Route
            path='/itin/:id'
            component={mainView}
          />
          */}
          {/* Single route with multiple options or multiple separate routes? */}
          {
            /* TODO: Keep track of application state and handle starting conditions (position and/or OTP router to use)
            <Route path='/@:latLonZoom(/plan)' component={props => <OtpApp {...props}><OtpRRExample /></OtpApp>} />
            <Route path='/plan' component={props => <OtpApp {...props}><OtpRRExample /></OtpApp>} />
            */
          }
        </div>
      </Router>
    )
  }
}

export default connect((state, ownProps) => {
  return { routerConfig: state.otp.config.reactRouter }
})(RouterWrapper)
