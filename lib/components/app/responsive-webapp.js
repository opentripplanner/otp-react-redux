import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import qs from 'qs'

import { setAutoPlan, setMapCenter, setMapZoom } from '../../actions/config'
import { setLocationToCurrent } from '../../actions/map'
import { getCurrentPosition } from '../../actions/location'
import { findNearbyStops } from '../../actions/api'
import { formChanged, parseQueryString, setQueryParam } from '../../actions/form'
import {
  MobileScreens,
  setMobileScreen,
  clearViewedStop,
  clearViewedTrip,
  setViewedRoute,
  setMainPanelContent
} from '../../actions/ui'
import { ensureSingleAccessMode } from '../../util/query'
import { getActiveSearch } from '../../util/state'

class ResponsiveWebapp extends Component {
  static propTypes = {
    desktopView: PropTypes.element,
    initZoomOnLocate: PropTypes.number,
    mobileView: PropTypes.element,
    query: PropTypes.object
  }

  _isMobile () {
    // TODO: consider using 3rd-party library
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
      if (this._isMobile() && nextProps.mobileScreen === MobileScreens.RESULTS_SUMMARY) {
        this.props.setMobileScreen(MobileScreens.SEARCH_FORM)
      }
    }

    // Check for change between ITINERARY and PROFILE routingTypes
    if (query.routingType !== nextProps.query.routingType) {
      // If we are entering 'ITINERARY' mode, ensure that one and only one access mode is selected
      if (nextProps.query.routingType === 'ITINERARY') {
        let queryModes = nextProps.query.mode.split(',')
        queryModes = ensureSingleAccessMode(queryModes)
        this.props.setQueryParam({ mode: queryModes.join(',') })
      }
    }

    if (this.props.activeItineraryIndex !== nextProps.activeItineraryIndex) {
      // FIXME: This should probably go somewhere else.
      // Trim question mark
      const params = qs.parse(window.location.search.substring(1))
      params.activeItinerary = nextProps.activeItineraryIndex
      window.history.pushState({ foo: 'bar' }, 'page 2', `?${qs.stringify(params)}`)
    }
  }

  componentDidMount () {
    const {location} = this.props
    if (location && location.search) {
      // Set search params and plan trip if routing enabled and a query exists
      // in the URL.
      this.props.parseQueryString(location.search)
    }
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
  const activeSearch = getActiveSearch(state.otp)
  return {
    activeItineraryIndex: activeSearch ? activeSearch.activeItinerary : 0,
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    mobileScreen: state.otp.ui.mobileScreen,
    initZoomOnLocate: state.otp.config.map && state.otp.config.map.initZoomOnLocate
  }
}

const mapDispatchToProps = {
  setAutoPlan,
  setLocationToCurrent,
  setMapCenter,
  setMapZoom,
  findNearbyStops,
  getCurrentPosition,
  formChanged,
  clearViewedStop,
  clearViewedTrip,
  setViewedRoute,
  setMainPanelContent,
  setMobileScreen,
  setQueryParam,
  parseQueryString
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp))
