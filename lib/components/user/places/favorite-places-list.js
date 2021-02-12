import React from 'react'
import { ControlLabel } from 'react-bootstrap'
import { connect } from 'react-redux'

import { UnpaddedList } from '../../form/styled'
import { PLACES_PATH } from '../../../util/constants'
import { isHomeOrWork } from '../../../util/user'
import FavoritePlaceRow from './favorite-place-row'

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 * Additions, edits, and deletions of places take effect immediately.
 */
const FavoritePlacesList = ({ loggedInUser }) => {
  const { savedLocations } = loggedInUser
  return (
    <div>
      <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>
      <UnpaddedList>
        {savedLocations.map((place, index) => (
          <FavoritePlaceRow
            isFixed={isHomeOrWork(place)}
            key={index}
            path={`${PLACES_PATH}/${index}`}
            place={place}
          />
        )
        )}

        {/* For adding a new place. */}
        <FavoritePlaceRow path={`${PLACES_PATH}/new`} />
      </UnpaddedList>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user.loggedInUser
  }
}

export default connect(mapStateToProps)(FavoritePlacesList)
