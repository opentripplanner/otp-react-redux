import { ConnectedRouter } from 'connected-react-router'
import { createHashHistory } from 'history'
import isEqual from 'lodash.isequal'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route, Switch, withRouter } from 'react-router'

import PrintLayout from './print-layout'
import AfterSignInScreen from '../user/after-signin-screen'
import SaveTripScreen from '../user/save-trip-screen'
import UserAccountScreen from '../user/user-account-screen'
import withLoggedInUser from '../user/with-logged-in-user'
import { setMapCenter, setMapZoom } from '../../actions/config'
import { formChanged, parseUrlQueryString } from '../../actions/form'
import { getCurrentPosition, receivedPositionResponse } from '../../actions/location'
import { setLocationToCurrent } from '../../actions/map'
import { handleBackButtonPress, matchContentToUrl } from '../../actions/ui'
import { getActiveItinerary, getTitle } from '../../util/state'

const { isMobile } = coreUtils.ui

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
    const urlParams = coreUtils.query.getUrlParams()
    const newSearchId = urlParams.ui_activeSearch
    // Determine if trip is being replanned by checking the active search ID
    // against the ID found in the URL params. If they are different, a new one
    // has been routed to (see handleBackButtonPress) and there is no need to
    // trigger a form change because necessarily the query will be different
    // from the previous query.
    const replanningTrip = newSearchId && this.props.activeSearchId && newSearchId !== this.props.activeSearchId
    if (!isEqual(prevProps.query, query) && !replanningTrip) {
      // Trigger on form change action if previous query is different from
      // current one AND trip is not being replanned already. This will
      // determine whether a search needs to be made, the mobile view needs
      // updating, etc.
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
        this.props.setLocationToCurrent({ locationType: 'from' })
        this.props.setMapCenter(pt)
        if (this.props.initZoomOnLocate) {
          this.props.setMapZoom({ zoom: this.props.initZoomOnLocate })
        }
      }
    }
    // If the path changes (e.g., via a back button press) check whether the
    // main content needs to switch between, for example, a viewer and a search.
    if (!isEqual(location.pathname, prevProps.location.pathname)) {
      // console.log('url changed to', location.pathname)
      this.props.matchContentToUrl(location)
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
    window.addEventListener('popstate', this.props.handleBackButtonPress)
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
    this.props.matchContentToUrl(this.props.location)
  }

  componentWillUnmount () {
    // Remove on back button press listener.
    window.removeEventListener('popstate', this.props.handleBackButtonPress)
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
  formChanged,
  getCurrentPosition,
  handleBackButtonPress,
  matchContentToUrl,
  parseUrlQueryString,
  receivedPositionResponse,
  setLocationToCurrent,
  setMapCenter,
  setMapZoom
}

const history = createHashHistory()

const WebappWithRouter = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp)
)

class RouterWrapper extends Component {
  /**
   * Combine the router props with the other props that get
   * passed to the exported component. This way it's possible for
   * the PrintLayout, UserAccountScreen, and other components to
   * receive the LegIcon or other needed props.
   */
  _combineProps = routerProps => {
    return { ...this.props, ...routerProps }
  }

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
                // App root
                '/',
                // Load app with preset lat/lon/zoom and optional router
                // NOTE: All params will be cast to :id in matchContentToUrl due
                // to a quirk with react-router.
                // https://github.com/ReactTraining/react-router/issues/5870#issuecomment-394194338
                '/@/:latLonZoomRouter',
                '/start/:latLonZoomRouter',
                // Route viewer (and route ID).
                '/route',
                '/route/:id',
                // Stop viewer (and stop ID).
                '/stop',
                '/stop/:id'
              ]}
              render={() => withLoggedInUser(<WebappWithRouter {...this.props} />)}
            />
            <Route
              path={'/account/welcome'}
              component={(routerProps) => {
                const props = this._combineProps(routerProps)
                return withLoggedInUser(<UserAccountScreen skipIfExistingUser {...props} />)
              }}
            />
            <Route
              path={'/account'}
              component={(routerProps) => {
                const props = this._combineProps(routerProps)
                return withLoggedInUser(<UserAccountScreen {...props} />)
              }}
            />
            <Route
              path={'/savetrip'}
              component={(routerProps) => {
                const props = this._combineProps(routerProps)
                return withLoggedInUser(<SaveTripScreen wizard {...props} />)
              }}
            />
            <Route
              path={'/signedin'}
              component={AfterSignInScreen}
            />
            <Route
              path='/print'
              component={(routerProps) => {
                const props = this._combineProps(routerProps)
                return <PrintLayout {...props} />
              }}
            />
            {/* For any other route, simply return the web app. */}
            <Route
              render={() => withLoggedInUser(<WebappWithRouter {...this.props} />)}
            />
          </Switch>
        </div>
      </ConnectedRouter>
    )
  }
}
const mapStateToWrapperProps = (state, ownProps) => ({ routerConfig: state.otp.config.reactRouter })
export default connect(mapStateToWrapperProps)(RouterWrapper)
