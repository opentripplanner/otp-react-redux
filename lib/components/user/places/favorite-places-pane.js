import React from 'react'
import { ControlLabel } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as userActions from '../../../actions/user'
import { cloneUserDataForEditing, isHomeOrWork } from '../../../util/user'
import FavoritePlaceRow from './favorite-place-row'

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 * Additions, edits, and deletions of places take effect immediately.
 */
const FavoritePlacesPane = ({ deleteUserPlace, loggedInUser }) => {
  const { savedLocations } = cloneUserDataForEditing(loggedInUser)
  return (
    <div>
      <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

      {savedLocations.map((place, index) => (
        <FavoritePlaceRow
          isFixed={isHomeOrWork(place)}
          key={index}
          onDelete={() => deleteUserPlace(index)}
          path={`/places/${index}`}
          place={place}
        />
      )
      )}

      {/* For adding a location. */}
      <FavoritePlaceRow path='/places/new' />
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  deleteUserPlace: userActions.deleteUserPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlacesPane)
