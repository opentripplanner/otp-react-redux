import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { CircleMarker } from 'react-leaflet'

class ElevationPointMarker extends Component {
  createLeafletElement () {}

  updateLeafletElement () {}

  render () {
    const { diagramLeg, elevationPoint, showElevationProfile } = this.props

    let elevationPointMarker = null
    if (showElevationProfile && diagramLeg && elevationPoint) {
      const pos = coreUtils.itinerary.legLocationAtDistance(
        diagramLeg,
        elevationPoint
      )
      if (pos) {
        elevationPointMarker = (
          <CircleMarker
            center={pos}
            fillColor='#084c8d'
            weight={6}
            color='#555'
            opacity={0.4}
            radius={5}
            fill
            fillOpacity={1}
          />
        )
      }
    }
    return elevationPointMarker
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    diagramLeg: state.otp.ui.diagramLeg,
    elevationPoint: state.otp.ui.elevationPoint,
    showElevationProfile: !!state.otp.config.elevationProfile
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ElevationPointMarker)
