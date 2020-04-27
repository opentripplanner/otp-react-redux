// TODO: Switch to coreUtils after otp-ui release.
// import coreUtils from '@opentripplanner/core-utils'
import { legLocationAtDistance } from '../../util/itinerary'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { CircleMarker } from 'react-leaflet'

/**
 * As the OTP user moves the cursor over the elevation tracking chart
 * of a walking or biking leg (to see which point of their itinerary is at which elevation),
 * ElevationPointMarker displays and moves a marker on the map to highlight
 * the location that corresponds to the cursor position on the elevation chart,
 * so the user can see the streets and paths that correspond to a portion of an elevation profile.
 */
class ElevationPointMarker extends Component {
  render () {
    const { diagramLeg, elevationPoint, showElevationProfile } = this.props

    // Compute the elevation point marker, if activeLeg and elevation profile is enabled.
    let elevationPointMarker = null
    if (showElevationProfile && diagramLeg && elevationPoint) {
      // TODO: Switch to coreUtils after otp-ui release.
      // const pos = coreUtils.itinerary.legLocationAtDistance(
      const pos = legLocationAtDistance(
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
