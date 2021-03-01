import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as mapActions from '../../../actions/map'
import { convertToLocation } from '../../../util/user'

const { matchLatLon } = coreUtils.map

/**
 * A shortcut button that wraps the provided PlaceComponent and sets
 * the provided place as the 'from' or 'to' place.
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

  render () {
    const { index, onDelete, onView, place, PlaceComponent } = this.props
    return (
      <PlaceComponent
        index={index}
        onClick={this._onSelect}
        onDelete={onDelete}
        onView={onView}
        place={place}
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
