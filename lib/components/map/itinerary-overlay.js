import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { GeoJSON } from 'react-leaflet'
import polyline from '@mapbox/polyline'

import { getActiveItinerary } from '../../util/state'

class ItineraryOverlay extends Component {

  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const itin = this.props.itinerary
    if (!itin) return null
    return (<div>
      {itin.legs.map((leg, index) => {
        const geojson = polyline.toGeoJSON(leg.legGeometry.points)
        return <GeoJSON key={index} data={geojson} />
      })}

    </div>)
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    itinerary: getActiveItinerary(state.otp)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ItineraryOverlay)
