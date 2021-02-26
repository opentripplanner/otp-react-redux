import React from 'react'
import { ControlLabel } from 'react-bootstrap'
import { connect } from 'react-redux'

import { UnpaddedList } from '../../form/styled'
import { CREATE_ACCOUNT_PLACES_PATH } from '../../../util/constants'
import { getPlaceBasePath } from '../../../util/user'
import SavedPlace from './saved-place'
import { FavoritePlace } from './styled'

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 * Additions, edits, and deletions of places take effect immediately.
 */
const FavoritePlaceList = ({ isCreating, loggedInUser }) => {
  const { savedLocations } = loggedInUser
  return (
    <div>
      <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>
      <UnpaddedList>
        {savedLocations.map((place, index) => (
          <SavedPlace
            index={index}
            isCreating={isCreating}
            key={index}
            place={place}
            PlaceComponent={FavoritePlace}
          />
        )
        )}

        {/* For adding a new place. */}
        <FavoritePlace
          icon='plus'
          name='Add another place'
          path={`${getPlaceBasePath(isCreating)}/new`}
        />
      </UnpaddedList>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const path = state.router.location.pathname
  const isCreating = path === CREATE_ACCOUNT_PLACES_PATH
  return {
    isCreating,
    loggedInUser: state.user.loggedInUser
  }
}

export default connect(mapStateToProps)(FavoritePlaceList)
