import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as userActions from '../../../actions/user'
import { getPlaceBasePath, isHomeOrWork } from '../../../util/user'

const EDIT_LABEL = 'Edit this place'
const PLAN_LABEL = 'Plan itinerary with this place'

/**
 * Wrapper for the Place component for saved places in OTP Middleware.
 */
class SavedPlace extends Component {
  _handleDelete = () => {
    const { deleteLoggedInUserPlace, index } = this.props
    deleteLoggedInUserPlace(index)
  }

  render () {
    const { isCreating, index, onClick, place, PlaceComponent } = this.props
    const { address, icon, name, type } = place
    const canDelete = !isHomeOrWork(place) || address
    const placeName = name || address
    const details = name && (address || `Set your ${type} address`)
    const useOnClick = address && onClick
    const label = useOnClick ? PLAN_LABEL : EDIT_LABEL
    const title = useOnClick ? `${placeName}${details && ` (${details})`}` : EDIT_LABEL

    return (
      <PlaceComponent
        ariaLabel={label}
        details={details}
        icon={icon}
        name={placeName}
        onClick={useOnClick}
        onDelete={canDelete && this._handleDelete}
        path={`${getPlaceBasePath(isCreating)}/${index}`}
        title={title}
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
