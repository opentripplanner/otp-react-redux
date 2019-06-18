import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEqual from 'lodash.isequal'
import { Route, Switch, withRouter, matchPath } from 'react-router'
import { createHashHistory } from 'history'
import { ConnectedRouter } from 'connected-react-router'

import PrintLayout from './print-layout'
import { setMapCenter, setMapZoom } from '../../actions/config'
import { setLocationToCurrent } from '../../actions/map'
import { getCurrentPosition, receivedPositionResponse } from '../../actions/location'
import { findRoute, updateUiUrlParams } from '../../actions/api'
import { formChanged, parseUrlQueryString, setQueryParam } from '../../actions/form'
import { MainPanelContent, setMainPanelContent, setViewedRoute, setViewedStop } from '../../actions/ui'

import { matchLatLon } from '../../util/map'
import { getUiUrlParams, getUrlParams, planParamsToQuery } from '../../util/query'
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

    if (!isEqual(prevProps.query, query)) {
      // console.log('form changed', prevProps.query, query)
      this.props.formChanged(prevProps.query, query)
    } else {
      // If the query does not change, but the search has, this likely means the
      // user has pressed the back button, and we need to update the query from
      // the search string and re-perform the search.
      const urlParams = getUrlParams()
      const planParams = planParamsToQuery(urlParams)
      let hasChangedParam = false
      Object.keys(planParams)
        .forEach(key => {
          let paramIsDifferent = false
          switch (key) {
            case 'from':
            case 'to':
              if (!matchLatLon(planParams[key], query[key])) {
                paramIsDifferent = true
              }
              break
            case '':
            default:
              if (!isEqual(planParams[key], query[key])) {
                paramIsDifferent = true
              }
              break
          }
          if (paramIsDifferent) {
            hasChangedParam = true
          }
        })
      if (hasChangedParam) {
        console.log('handle search change', prevProps.location.search, location.search)
        console.log(query, planParams)
        // this.props.setQueryParam(planParams)
      }
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

    // Check for change in app location (main panel)
    if (!isEqual(location.pathname, prevProps.location.pathname)) {
      this._handleUrlChange(this.props)
    }

    // Check for any updates to tracked UI state properties and update URL as needed
    if (!isEqual(this.props.uiUrlParams, prevProps.uiUrlParams)) {
      this.props.updateUiUrlParams(this.props.uiUrlParams)
    }
  }

  componentDidMount () {
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
      this.props.parseUrlQueryString(location.search)
    }
    this._handleUrlChange(this.props)
  }

  _handleUrlChange = (props) => {
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
    uiUrlParams: getUiUrlParams(state.otp),
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    mobileScreen: state.otp.ui.mobileScreen,
    initZoomOnLocate: state.otp.config.map && state.otp.config.map.initZoomOnLocate,
    modeGroups: state.otp.config.modeGroups,
    title
  }
}

const mapDispatchToProps = {
  setLocationToCurrent,
  setMapCenter,
  setMapZoom,
  getCurrentPosition,
  findRoute,
  formChanged,
  receivedPositionResponse,
  setMainPanelContent,
  setQueryParam,
  setViewedRoute,
  setViewedStop,
  parseUrlQueryString,
  updateUiUrlParams
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
              path='/'
              render={() => <WebappWithRouter {...this.props} />}
            />
            <Route
              exact
              path={[
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
