import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as mapActions from '../../../actions/map'
import { convertToLocation, convertToPlace } from '../../../util/user'
import MainPanelPlace from './main-panel-place'

const { formatStoredPlaceName, getDetailText, matchLatLon } = coreUtils.map

/**
 * Calls convertToPlace, and adds the id of the original location.
 */
function convertToPlaceWithId (location) {
  const place = convertToPlace(location)
  return {
    ...place,
    id: location.id
  }
}

/**
 * A shortcut button that sets the provided place as the 'from' or 'to' Place.
 * It wraps MainPanelPlace to let the user edit, view or delete the place.
 */
class PlaceShortcut extends Component {
  /**
   * Sets the from or to location based on the query using the provided action.
   */
  _setFromOrToLocation = location => {
    const { query, setLocation } = this.props
    // If 'to' not set and 'from' does not match location, set as 'to'.
    if (
      !query.to && (
        !query.from || !matchLatLon(location, query.from)
      )
    ) {
      setLocation({ location, locationType: 'to' })
    } else if (
      // Vice versa for setting as 'from'.
      !query.from &&
        !matchLatLon(location, query.to)
    ) {
      setLocation({ location, locationType: 'from' })
    }
  }

  _onSelect = () => {
    const { place } = this.props
    if (place.blank) {
      window.alert(`Enter origin/destination in the form (or set via map click) and click the resulting marker to set as ${place.type} location.`)
    } else {
      // Convert to OTP UI location before sending events
      // (to avoid issues when user clicks Forget/Save location
      // multiple times subsequently)
      this._setFromOrToLocation(convertToLocation(place))
    }
  }

  _onView = () => {
    const { onView, place } = this.props
    onView({ stopId: place.id })
  }

  _onDelete = () => {
    const { onDelete, place } = this.props
    onDelete(place.id)
  }

  render () {
    const { onDelete, onView, path, place } = this.props
    // localStorage places (where path is not provided) need to be converted,
    // so the correct fields are passed to MainPanelPlace.
    const convertedPlace = path ? place : convertToPlaceWithId(place)

    const { address, blank, icon, name, type } = convertedPlace
    const placeTitle = formatStoredPlaceName(place)
    const placeAddress = blank ? null : address

    let placeName
    let details
    if (path) { // for middleware places
      placeName = name || address
      details = name && (address || `Set your ${type} address`)
    } else {
      placeName = formatStoredPlaceName(place, false)
      details = getDetailText(place)
    }

    return (
      <MainPanelPlace
        details={details}
        icon={icon}
        name={placeName}
        onClick={(path && !address) ? null : this._onSelect}
        onDelete={onDelete && this._onDelete}
        onView={onView && this._onView}
        path={path}
        title={placeTitle || placeAddress}
      />
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceShortcut)
