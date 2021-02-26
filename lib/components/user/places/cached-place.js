import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'

const { formatStoredPlaceName, getDetailText } = coreUtils.map

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
    const canDelete = !blank && ['stop', 'home', 'work', 'recent'].indexOf(type) !== -1

    return (
      <PlaceComponent
        details={getDetailText(place)}
        icon={icon}
        name={formatStoredPlaceName(place, false)}
        onClick={onClick}
        onDelete={canDelete && onDelete && this._onDelete}
        onView={onView && this._onView}
        title={formatStoredPlaceName(place)}
      />
    )
  }
}

export default CachedPlace
