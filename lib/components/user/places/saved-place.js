import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as userActions from '../../../actions/user'
import { getPlaceBasePath, isHomeOrWork } from '../../../util/user'

const EDIT_LABEL = 'Edit this place'

/**
 * Wrapper for the Place component for saved places in OTP Middleware.
 */
class SavedPlace extends Component {
  _handleDelete = () => {
    const { deleteLoggedInUserPlace, index } = this.props
    deleteLoggedInUserPlace(index)
  }

  render () {
    const { isCreating, index, label, onClick, place, PlaceComponent } = this.props
    const placeLabel = place && (label || EDIT_LABEL)
    const { address, icon, name, type } = place
    const canDelete = !isHomeOrWork(place) || address
    //const placeTitle = `${placeName}${details && ` (${details})`}`

    return (
      <PlaceComponent
        ariaLabel={placeLabel}
        details={name && (address || `Set your ${type} address`)}
        icon={icon}
        name={name || address}
        onClick={address && onClick}
        onDelete={canDelete && this._handleDelete}
        path={`${getPlaceBasePath(isCreating)}/${index}`}
        title={placeLabel}
      />
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = {
  deleteLoggedInUserPlace: userActions.deleteLoggedInUserPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(SavedPlace)
