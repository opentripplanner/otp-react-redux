import bowser from 'bowser'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqual from 'lodash.isequal'
import { Route, Switch, withRouter } from 'react-router'
import { createHashHistory } from 'history'
import { ConnectedRouter } from 'connected-react-router'

import PrintLayout from './print-layout'
import { setMapCenter, setMapZoom } from '../../actions/config'
import { setLocationToCurrent } from '../../actions/map'
import { getCurrentPosition, receivedPositionResponse } from '../../actions/location'
import { formChanged, parseUrlQueryString } from '../../actions/form'
import { handleBackButtonPress, matchContentToUrl } from '../../actions/ui'
import { getUrlParams } from '../../util/query'
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
        this.props.setLocationToCurrent({ type: 'from' })
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
    // For some bizarre reason, logging something to the console somehow improves
    // the operation of the MenuItem onSelect (for onClick only) for Internet
    // Explorer.
    if (bowser.name === 'Internet Explorer') console.log('Loading...')
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
    window.removeEventListener('popstate')
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
              render={() => <WebappWithRouter {...this.props} />}
            />
            <Route
              path='/print'
              component={PrintLayout}
            />
            {/* For any other route, simply return the web app. */}
            <Route
              render={() => <WebappWithRouter {...this.props} />}
            />
          </Switch>
        </div>
      </ConnectedRouter>
    )
  }
}

export default connect((state, ownProps) => {
  return { routerConfig: state.otp.config.reactRouter }
})(RouterWrapper)
