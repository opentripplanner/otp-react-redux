import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Map } from 'react-leaflet'

import { setLocation, updateMapState } from '../../actions/map'
import { constructLocation } from '../../util/map'
import { getActiveItinerary, getActiveSearch } from '../../util/state'

class BaseMap extends Component {
  state = {}
  static propTypes = {
    mapClick: PropTypes.func,
    mapState: PropTypes.object,
    setLocation: PropTypes.func // TODO: rename from action name to avoid namespace conflict?
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.mapState.focus && nextProps.mapState.focus !== this.props.mapState.focus) {
      this.setState({zoomToTarget: true})
    }
  }

  _onClick = (e) => {
    const location = constructLocation(e.latlng)
    if (!this.props.isFromSet) this.props.setLocation('from', location)
    else if (!this.props.isToSet) this.props.setLocation('to', location)
  }

  _mapBoundsChanged = (e) => {
    if (this.state.zoomToTarget) {
      setTimeout(() => { this.setState({zoomToTarget: false}) }, 200)
      return false
    }
    const bounds = e.target.getBounds()
    if (!bounds.equals(this.props.mapState.bounds)) {
      this.props.updateMapState({bounds})
    }
  }

  render () {
    const {
      children,
      mapState
    } = this.props
    const mapProps = {
      ref: 'map',
      className: 'map',
      bounds: mapState.bounds,
      onClick: this._onClick,
      onMoveEnd: this._mapBoundsChanged,
      onZoomEnd: this._mapBoundsChanged
    }
    return (
      <Map
        {...mapProps}>
        {children}
      </Map>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    config: state.otp.config,
    mapState: state.otp.mapState,
    isFromSet: state.otp.currentQuery.from && state.otp.currentQuery.from.lat !== null && state.otp.currentQuery.from.lon !== null,
    isToSet: state.otp.currentQuery.to && state.otp.currentQuery.to.lat !== null && state.otp.currentQuery.to.lon !== null,
    itinerary: getActiveItinerary(state.otp)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setLocation: (type, location) => { dispatch(setLocation({ type, location })) },
    updateMapState: (props) => { dispatch(updateMapState(props)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseMap)
