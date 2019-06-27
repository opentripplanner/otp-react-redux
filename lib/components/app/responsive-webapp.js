import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqual from 'lodash.isequal'
import { Route, Switch, withRouter, matchPath } from 'react-router'
import { createHashHistory } from 'history'
import { ConnectedRouter } from 'connected-react-router'

import PrintLayout from './print-layout'
import { setMapCenter, setMapZoom } from '../../actions/config'
import { clearLocation, setLocationToCurrent } from '../../actions/map'
import { getCurrentPosition, receivedPositionResponse } from '../../actions/location'
import { findRoute } from '../../actions/api'
import {
  clearActiveSearch,
  setActiveSearch,
  formChanged,
  parseUrlQueryString,
  setQueryParam
} from '../../actions/form'
import { setActiveItinerary } from '../../actions/narrative'
import { MainPanelContent, setMainPanelContent, setViewedRoute, setViewedStop } from '../../actions/ui'

import { getUiUrlParams, getUrlParams } from '../../util/query'
import { getTitle, isMobile } from '../../util/ui'
import { getActiveItinerary } from '../../util/state'

class ResponsiveWebapp extends Component {
  static propTypes = {
    desktopView: PropTypes.element,
    initZoomOnLocate: PropTypes.number,
    mobileView: PropTypes.element,
    query: PropTypes.object
  }

  /** Lifecycle methods **/

  componentDidUpdate (prevProps) {
    const { currentPosition, location, query, title } = this.props
    document.title = title
    const urlParams = getUrlParams()
    const newSearchId = urlParams.ui_activeSearch
    const replanningTrip = newSearchId && this.props.activeSearchId && newSearchId !== this.props.activeSearchId
    if (!isEqual(prevProps.query, query) && !replanningTrip) {
      // Trigger on form change action if previous query is different from
      // current one AND . This will determine whether a search needs to be made, the
      // mobile view needs updating, etc.
      this.props.formChanged(prevProps.query, query)
    }

    // check if device position changed (typically only set once, on initial page load)
    if (currentPosition !== prevProps.currentPosition) {
      if (currentPosition.error || !currentPosition.coords) return
      const pt = {
        lat: currentPosition.coords.latitude,
        lon: currentPosition.coords.longitude
      }

      // if in mobile mode and from field is not set, use current location as from and recenter map
      if (isMobile() && this.props.query.from === null) {
        this.props.setLocationToCurrent({ type: 'from' })
        this.props.setMapCenter(pt)
        if (this.props.initZoomOnLocate) {
          this.props.setMapZoom({ zoom: this.props.initZoomOnLocate })
        }
      }
    }

    // Check for change between ITINERARY and PROFILE routingTypes
    // TODO: restore this for profile mode
    /* if (query.routingType !== nextProps.query.routingType) {
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
    } */
  }

  componentDidMount () {
    // Add on back button press behavior.
    window.onpopstate = this._onBackButtonPress
    const { location, title } = this.props
    document.title = title
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

    if (location && location.search) {
      // Set search params and plan trip if routing enabled and a query exists
      // in the URL.
      this.props.parseUrlQueryString()
    }
    // Handle routing to a specific part of the app (e.g. stop viewer) on page
    // load.
    this._matchContentToUrl(this.props)
  }

  componentWillUnmount () {
    // Remove on back button press listener.
    window.onpopstate = () => {}
  }

  _onBackButtonPress = (e) => {
    // Get new search ID from URL after back button pressed.
    // console.log('back button pressed', e)
    const urlParams = getUrlParams()
    const newSearchId = urlParams.ui_activeSearch
    const newItinIndex = +urlParams.ui_activeItinerary || 0
    const newSearch = this.props.searches[newSearchId]
    if (newSearch) {
      // If back button pressed and active search has changed, set search to
      // previous search ID.
      if (this.props.activeSearchId !== newSearchId) {
        this.props.setActiveSearch(newSearchId)
      } else if (this.props.uiUrlParams.ui_activeItinerary !== newItinIndex) {
        // Active itinerary index has changed.
        this.props.setActiveItinerary({ index: newItinIndex })
      }
    } else {
      // The back button was pressed, but there was no corresponding search
      // found for the new search ID. Derive search from URL params.
      if (!newSearchId && this.props.activeSearchId) {
        // There is no search ID. Clear active search and from/to
        this.props.clearActiveSearch()
        this.props.clearLocation({ type: 'from' })
        this.props.clearLocation({ type: 'to' })
      } else if (newSearchId) {
        console.warn(`No search found in state history for search ID: ${newSearchId}. Replanning...`)
        // Set query to the params found in the URL and perform routing query
        // for search ID.
        // Also, we don't want to update the URL here because that will funk with
        // the browser history.
        this.props.parseUrlQueryString(urlParams)
      }
    }
  }

  /**
   * Checks URL and redirects app to appropriate content (e.g., viewed
   * route or stop).
   */
  _matchContentToUrl = (props) => {
    const { findRoute, location, setMainPanelContent, setViewedRoute, setViewedStop } = props
    // This is a bit of a hack to make up for the fact that react-router does
    // not always provide the match params as expected.
    // https://github.com/ReactTraining/react-router/issues/5870#issuecomment-394194338
    const root = location.pathname.split('/')[1]
    const match = matchPath(location.pathname, {
      path: `/${root}/:id`,
      exact: true,
      strict: false
    })
    const id = match && match.params && match.params.id
    switch (root) {
      case 'route':
        if (id) {
          findRoute({ routeId: id })
          setViewedRoute({ routeId: id })
        } else {
          setViewedRoute(null)
          setMainPanelContent(MainPanelContent.ROUTE_VIEWER)
        }
        break
      case 'stop':
        if (id) {
          setViewedStop({ stopId: id })
        } else {
          setViewedStop(null)
          setMainPanelContent(MainPanelContent.STOP_VIEWER)
        }
        break
      default:
        setMainPanelContent(null)
        break
    }
  }

  render () {
    const { desktopView, mobileView } = this.props
    return isMobile() ? mobileView : desktopView
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const title = getTitle(state)
  return {
    activeItinerary: getActiveItinerary(state.otp),
    activeSearchId: state.otp.activeSearchId,
    uiUrlParams: getUiUrlParams(state.otp),
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    searches: state.otp.searches,
    mobileScreen: state.otp.ui.mobileScreen,
    initZoomOnLocate: state.otp.config.map && state.otp.config.map.initZoomOnLocate,
    modeGroups: state.otp.config.modeGroups,
    title
  }
}

const mapDispatchToProps = {
  clearActiveSearch,
  clearLocation,
  findRoute,
  formChanged,
  getCurrentPosition,
  parseUrlQueryString,
  receivedPositionResponse,
  setActiveItinerary,
  setActiveSearch,
  setLocationToCurrent,
  setMainPanelContent,
  setMapCenter,
  setMapZoom,
  setQueryParam,
  setViewedRoute,
  setViewedStop
}

const history = createHashHistory()

const WebappWithRouter = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp)
)

class RouterWrapper extends Component {
  render () {
    const { routerConfig } = this.props
    return (
      <ConnectedRouter
        basename={routerConfig && routerConfig.basename}
        history={history}>
        <div>
          <Switch>
            <Route
              exact
              path={[
                '/',
                '/route',
                '/route/:id',
                '/stop',
                '/stop/:id'
              ]}
              render={() => <WebappWithRouter {...this.props} />}
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
              /* TODO: Keep track of application state and handle starting conditions
               * (position and/or OTP router to use)
              <Route
                path='/@:latLonZoom(/plan)'
                component={props => <OtpApp {...props}><OtpRRExample /></OtpApp>} />
              <Route
                path='/plan'
                component={props => <OtpApp {...props}><OtpRRExample /></OtpApp>} />
              */
            }
          </Switch>
        </div>
      </ConnectedRouter>
    )
  }
}

export default connect((state, ownProps) => {
  return { routerConfig: state.otp.config.reactRouter }
})(RouterWrapper)
