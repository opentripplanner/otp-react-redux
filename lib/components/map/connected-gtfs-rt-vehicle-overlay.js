import TransitVehicleOverlay from '@opentripplanner/transit-vehicle-overlay'
// import PropTypes from 'prop-types'
import React from 'react'
import { MapLayer } from 'react-leaflet'
// import connect from 'react-redux'

// import * as gtfsRtActions from '../../actions/gtfs-rt'

// const vehicleLocations = [{"id":"UCF-pos-29","vehicle":{"trip":{},"position":{"latitude":28.57913,"longitude":-81.20885,"bearing":50},"timestamp":"1625166896","vehicle":{"id":"U36","label":"U36"}}},{"id":"UCF-pos-11","vehicle":{"trip":{},"position":{"latitude":28.60888,"longitude":-81.21015,"bearing":205},"timestamp":"1625166896","vehicle":{"id":"U18","label":"U18"}}},{"id":"UCF-pos-50","vehicle":{"trip":{},"position":{"latitude":28.5992,"longitude":-81.19552,"bearing":235},"timestamp":"1625166897","vehicle":{"id":"U59","label":"U59"}}},{"id":"UCF-pos-1","vehicle":{"trip":{},"position":{"latitude":28.54739,"longitude":-81.38644,"bearing":88},"timestamp":"1625166896","vehicle":{"id":"U56","label":"U56"}}},{"id":"UCF-pos-42","vehicle":{"trip":{},"position":{"latitude":28.58753,"longitude":-81.19555,"bearing":26},"timestamp":"1625166896","vehicle":{"id":"U49","label":"U49"}}},{"id":"UCF-pos-45","vehicle":{"trip":{},"position":{"latitude":28.60304,"longitude":-81.20101,"bearing":354},"timestamp":"1625166896","vehicle":{"id":"U52","label":"U52"}}},{"id":"UCF-pos-19","vehicle":{"trip":{},"position":{"latitude":28.5987,"longitude":-81.20226,"bearing":337},"timestamp":"1625166896","vehicle":{"id":"U26","label":"U26"}}},{"id":"UCF-pos-36","vehicle":{"trip":{},"position":{"latitude":28.62404,"longitude":-81.20636,"bearing":11},"timestamp":"1625166897","vehicle":{"id":"U43","label":"U43"}}},{"id":"UCF-pos-26","vehicle":{"trip":{},"position":{"latitude":28.59895,"longitude":-81.20287,"bearing":276},"timestamp":"1625166895","vehicle":{"id":"U33","label":"U33"}}},{"id":"UCF-pos-5","vehicle":{"trip":{},"position":{"latitude":28.56968,"longitude":-81.20551,"bearing":181},"timestamp":"1625166896","vehicle":{"id":"U12","label":"U12"}}},{"id":"UCF-pos-52","vehicle":{"trip":{},"position":{"latitude":28.59505,"longitude":-81.20212,"bearing":313},"timestamp":"1625166896","vehicle":{"id":"U61","label":"U61"}}},{"id":"UCF-pos-3","vehicle":{"trip":{},"position":{"latitude":28.61118,"longitude":-81.21152,"bearing":38},"timestamp":"1625166896","vehicle":{"id":"U10","label":"U10"}}},{"id":"UCF-pos-12","vehicle":{"trip":{},"position":{"latitude":28.60206,"longitude":-81.19698,"bearing":190},"timestamp":"1625166895","vehicle":{"id":"U19","label":"U19"}}},{"id":"UCF-pos-44","vehicle":{"trip":{},"position":{"latitude":28.57967,"longitude":-81.20786,"bearing":181},"timestamp":"1625166896","vehicle":{"id":"U51","label":"U51"}}},{"id":"UCF-pos-14","vehicle":{"trip":{},"position":{"latitude":28.61548,"longitude":-81.19613,"bearing":269},"timestamp":"1625166897","vehicle":{"id":"U21","label":"U21"}}},{"id":"UCF-pos-22","vehicle":{"trip":{},"position":{"latitude":28.60502,"longitude":-81.19593,"bearing":31},"timestamp":"1625166896","vehicle":{"id":"U29","label":"U29"}}},{"id":"UCF-pos-59","vehicle":{"trip":{},"position":{"latitude":28.49091,"longitude":-81.24297,"bearing":167},"timestamp":"1625166896","vehicle":{"id":"U68","label":"U68"}}},{"id":"UCF-pos-40","vehicle":{"trip":{},"position":{"latitude":28.58671,"longitude":-81.20815,"bearing":101},"timestamp":"1625166896","vehicle":{"id":"U47","label":"U47"}}},{"id":"UCF-pos-31","vehicle":{"trip":{},"position":{"latitude":28.59876,"longitude":-81.20234,"bearing":349},"timestamp":"1625166896","vehicle":{"id":"U38","label":"U38"}}},{"id":"UCF-pos-7","vehicle":{"trip":{},"position":{"latitude":28.60237,"longitude":-81.2073,"bearing":269},"timestamp":"1625166895","vehicle":{"id":"U14","label":"U14"}}},{"id":"UCF-pos-55","vehicle":{"trip":{},"position":{"latitude":28.37682,"longitude":-81.2766,"bearing":358},"timestamp":"1625166897","vehicle":{"id":"U64","label":"U64"}}},{"id":"UCF-pos-43","vehicle":{"trip":{},"position":{"latitude":28.60634,"longitude":-81.19063,"bearing":36},"timestamp":"1625166897","vehicle":{"id":"U50","label":"U50"}}},{"id":"UCF-pos-35","vehicle":{"trip":{},"position":{"latitude":28.6024,"longitude":-81.20581,"bearing":285},"timestamp":"1625166896","vehicle":{"id":"U42","label":"U42"}}},{"id":"UCF-pos-32","vehicle":{"trip":{},"position":{"latitude":28.59819,"longitude":-81.19729,"bearing":143},"timestamp":"1625166897","vehicle":{"id":"U39","label":"U39"}}},{"id":"UCF-pos-15","vehicle":{"trip":{},"position":{"latitude":28.60054,"longitude":-81.20489,"bearing":285},"timestamp":"1625166896","vehicle":{"id":"U22","label":"U22"}}},{"id":"UCF-pos-28","vehicle":{"trip":{},"position":{"latitude":28.5794,"longitude":-81.20637,"bearing":271},"timestamp":"1625166897","vehicle":{"id":"U35","label":"U35"}}},{"id":"UCF-pos-16","vehicle":{"trip":{},"position":{"latitude":28.59798,"longitude":-81.2078,"bearing":181},"timestamp":"1625166898","vehicle":{"id":"U23","label":"U23"}}},{"id":"UCF-pos-2","vehicle":{"trip":{},"position":{"latitude":28.60071,"longitude":-81.2054,"bearing":103},"timestamp":"1625166897","vehicle":{"id":"U57","label":"U57"}}},{"id":"UCF-pos-47","vehicle":{"trip":{},"position":{"latitude":28.58805,"longitude":-81.21426,"bearing":359},"timestamp":"1625166897","vehicle":{"id":"U54","label":"U54"}}},{"id":"UCF-pos-33","vehicle":{"trip":{},"position":{"latitude":28.58338,"longitude":-81.21484,"bearing":150},"timestamp":"1625166896","vehicle":{"id":"U40","label":"U40"}}},{"id":"UCF-pos-39","vehicle":{"trip":{},"position":{"latitude":28.5989,"longitude":-81.20271,"bearing":292},"timestamp":"1625166896","vehicle":{"id":"U46","label":"U46"}}},{"id":"UCF-pos-21","vehicle":{"trip":{},"position":{"latitude":28.59809,"longitude":-81.2079,"bearing":183},"timestamp":"1625166897","vehicle":{"id":"U28","label":"U28"}}},{"id":"UCF-pos-24","vehicle":{"trip":{},"position":{"latitude":28.60061,"longitude":-81.20503,"bearing":288},"timestamp":"1625166897","vehicle":{"id":"U31","label":"U31"}}}]

/**
 * Class that loads a GTFS-rt vehicle positions feed.
 */
class GtfsRtVehicleOverlay extends MapLayer {
  // static propTypes = {
  //   feedUrl: PropTypes.string, // url to GTFS-rt feed in protocol buffer format.
  //   visible: PropTypes.bool
  // }

  constructor (props) {
    super(props)
    this.state = {
    //   visible: props.visible
    }
  }

  componentDidMount () {
    this.props.registerOverlay(this)
    // this.props.gtfsRtVehiclePositionsQuery(this.props.feedUrl)
  }

  componentDidUpdate (prevProps) {
    // if (!prevProps.visible && this.props.visible) {
    this._startRefreshing()
    // } else if (prevProps.visible && !this.props.visible) {
    //   this._stopRefreshing()
    // }
  }

  componentWillUnmount () {
    this._stopRefreshing()
  }

  onOverlayAdded = () => {
    // this.setState({ visible: true })
    this._startRefreshing()
  }

  onOverlayRemoved = () => {
    // this.setState({ visible: false })
    this._stopRefreshing()
  }

  createLeafletElement () {}

  updateLeafletElement () {}

  _startRefreshing () {
    // ititial station retrieval
    // this.props.zipcarLocationsQuery(this.props.api)

    // set up timer to refresh stations periodically
    this._refreshTimer = setInterval(() => {
      // this.props.zipcarLocationsQuery(this.props.api)
    }, 30000) // defaults to every 30 sec. TODO: make this configurable?*/
  }

  _stopRefreshing () {
    if (this._refreshTimer) clearInterval(this._refreshTimer)
  }

  render () {
    // const { vehicleLocations } = this.props
    // const { visible } = this.state
    return (
      <TransitVehicleOverlay
        {...this.props}
        // zoom={zoom}
        // center={center}
        // vehicleList={vehicleLocations}
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
        // visible={visible}
      />
    )
  }
}

// connect to the redux store

// const mapStateToProps = (state, ownProps) => {
//  return {
//    // vehicleLocations: state.otp.overlay.transitVehicles[]?.locations
//  }
// }

// const mapDispatchToProps = {
//   // gtfsRtVehiclePositionsQuery: gtfsRtActions.gtfsRtVehiclePositionsQuery
// }

// export default connect(mapStateToProps, mapDispatchToProps)(GtfsRtVehicleOverlay)
export default GtfsRtVehicleOverlay
