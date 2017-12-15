import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { setAutoPlan, setMapCenter } from '../../actions/config'
import { setLocationToCurrent } from '../../actions/map'
import { getCurrentPosition } from '../../actions/location'
import { findNearbyStops } from '../../actions/api'

class ResponsiveWebapp extends Component {
  static propTypes = {
    browser: PropTypes.object,
    desktopView: PropTypes.element,
    mobileView: PropTypes.mobile,
    query: PropTypes.object
  }

  /** Lifecycle methods **/

  componentWillReceiveProps (nextProps) {
    // check if were changing browser media types
    if (nextProps.browser.mediaType !== this.props.browser.mediaType) {
      this._newMediaType(nextProps)
    }

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
      if (this.props.browser.mediaType === 'extraSmall' && this.props.query.from === null) {
        this.props.setLocationToCurrent('from')
        this.props.setMapCenter(pt)
      }
    }
  }

  componentDidMount () {
    this._newMediaType(null, true)
    // FIXME: Browser type is probably better to check than screen size when
    // determining whether to get user's location
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // If on mobile browser, check position on load
      this.props.getCurrentPosition()
    }
  }

  /** Internal methods **/

  // called when switching between desktop and mobile modes
  _newMediaType (props, initialPageLoad) {
    props = props || this.props
    const mediaType = props.browser.mediaType
    if (mediaType === 'extraSmall') { // entering mobile mode
      props.setAutoPlan(false)
    } else { // entering desktop mode
      props.setAutoPlan(true)
    }
  }

  render () {
    const { browser, desktopView, mobileView } = this.props
    return browser.mediaType !== 'extraSmall' ? desktopView : mobileView
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    browser: state.browser,
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery
  }
}


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setAutoPlan: autoPlan => dispatch(setAutoPlan({ autoPlan })),
    setLocationToCurrent: type => dispatch(setLocationToCurrent({ type })),
    setMapCenter: point => dispatch(setMapCenter(point)),
    findNearbyStops: params => dispatch(findNearbyStops(params)),
    getCurrentPosition: () => dispatch(getCurrentPosition())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp)
