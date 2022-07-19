import { connect } from 'react-redux'
import { Leg } from '@opentripplanner/types'
import { Marker } from 'react-map-gl'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'

type Props = {
  diagramLeg: Leg
  elevationPoint: number
  showElevationProfile?: boolean
}
/**
 * As the OTP user moves the cursor over the elevation tracking chart
 * of a walking or biking leg (to see which point of their itinerary is at which elevation),
 * ElevationPointMarker displays and moves a marker on the map to highlight
 * the location that corresponds to the cursor position on the elevation chart,
 * so the user can see the streets and paths that correspond to a portion of an elevation profile.
 */
class ElevationPointMarker extends Component<Props> {
  render() {
    const { diagramLeg, elevationPoint, showElevationProfile } = this.props

    const markerStyle = {
      backgroundColor: '#87CEFA',
      border: '2px solid #FFF',
      borderRadius: '50%',
      height: '15px',
      width: '15px'
    }

    // Compute the elevation point marker, if activeLeg and elevation profile is enabled.
    let elevationPointMarker = null
    if (showElevationProfile && diagramLeg && elevationPoint) {
      const pos = coreUtils.itinerary.legLocationAtDistance(
        diagramLeg,
        elevationPoint
      )
      if (pos) {
        elevationPointMarker = (
          <Marker latitude={pos[0]} longitude={pos[1]}>
            <div style={markerStyle} />
          </Marker>
        )
      }
    }
    return elevationPointMarker
  }
}

// TODO: OTP-RR State Type
const mapStateToProps = (state: any) => {
  return {
    diagramLeg: state.otp.ui.diagramLeg,
    elevationPoint: state.otp.ui.elevationPoint,
    showElevationProfile: !!state.otp.config.elevationProfile
  }
}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ElevationPointMarker)
