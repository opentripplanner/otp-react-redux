import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as mapActions from '../../../actions/map'
import { convertToLocation, convertToPlace } from '../../../util/user'
import MainPanelPlace from './main-panel-place'

const { formatStoredPlaceName, getDetailText, matchLatLon } = coreUtils.map

/**
 * Calls convertToPlace, and adds some more fields to the resulting place for rendering.
 */
function convertToPlaceWithDetails (location) {
  const place = convertToPlace(location)
  return {
    ...place,
    details: getDetailText(location),
    id: location.id,
    title: formatStoredPlaceName(location)
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
    const convertedPlace = path ? place : convertToPlaceWithDetails(place)
    return (
      <MainPanelPlace
        onClick={convertedPlace.address ? this._onSelect : null}
        onDelete={onDelete && this._onDelete}
        onView={onView && this._onView}
        path={path}
        place={convertedPlace}
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
