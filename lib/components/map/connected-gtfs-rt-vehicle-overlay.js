import TransitVehicleOverlay from '@opentripplanner/stops-overlay'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import connect from 'react-redux'

// import * as gtfsRtActions from '../../actions/gtfs-rt'

/**
 * Class that loads a GTFS-rt vehicle positions feed.
 */
class GtfsRtVehicleOverlay extends Component {
  static PropTypes = {
    feedUrl: PropTypes.string, // url to GTFS-rt feed in protocol buffer format.
    visible: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      visible: props.visible
    }
  }

  componentDidMount () {
    this.props.registerOverlay(this)
    this.props.gtfsRtVehiclePositionsQuery(this.props.feedUrl)
  }

  onOverlayAdded = () => {
    this.setState({ visible: true })
  }

  onOverlayRemoved = () => {
    this.setState({ visible: false })
  }

  render () {
    const { vehicleLocations } = this.props
    const { visible } = this.state
    return (
      <TransitVehicleOverlay
        {...this.props}
        // zoom={zoom}
        // center={center}
        vehicleList={vehicleLocations}
        // onVehicleClicked={clickVehicle}
        // selectedVehicle={tv}
        // showOnlyTracked={showOnlyTracked}
        // pattern={getRoutePattern(tv)}
        // onRecenterMap={recenter}
        // color={clr}
        // highlightColor={highlightColor}
        // symbols={markers}
        // TooltipSlot={VehicleTooltip}
        // PopupSlot={VehiclePopup}
        visible={visible}
      />
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    // vehicleLocations: state.otp.overlay.transitVehicles[]?.locations
  }
}

const mapDispatchToProps = {
  // gtfsRtVehiclePositionsQuery: gtfsRtActions.gtfsRtVehiclePositionsQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(GtfsRtVehicleOverlay)
