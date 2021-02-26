import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'

const { formatStoredPlaceName, getDetailText } = coreUtils.map

const PLAN_LABEL = 'Plan itinerary with this place'

/**
 * Wrapper for the Place component for places cached in localStorage.
 */
class CachedPlace extends Component {
  _onView = () => {
    const { onView, place } = this.props
    onView({ stopId: place.id })
  }

  _onDelete = () => {
    const { onDelete, place } = this.props
    onDelete(place.id)
  }

  render () {
    const { onClick, onDelete, onView, place, PlaceComponent } = this.props
    const { blank, icon, type } = place

    const placeName = formatStoredPlaceName(place, false)
    const placeTitle = formatStoredPlaceName(place)
    const details = getDetailText(place)
    const canDelete = !blank && ['stop', 'home', 'work', 'recent'].indexOf(type) !== -1

    return (
      <PlaceComponent
        ariaLabel={PLAN_LABEL}
        details={details}
        icon={icon}
        name={placeName}
        onClick={onClick}
        onDelete={canDelete && onDelete && this._onDelete}
        onView={onView && this._onView}
        title={placeTitle}
      />
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(CachedPlace)
