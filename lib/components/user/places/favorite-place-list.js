import React from 'react'
import { ControlLabel } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as userActions from '../../../actions/user'
import { UnpaddedList } from '../../form/styled'
import { CREATE_ACCOUNT_PLACES_PATH } from '../../../util/constants'
import { getPlaceBasePath } from '../../../util/user'

import { FavoritePlace } from './styled'

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 * Additions, edits, and deletions of places take effect immediately.
 */
const FavoritePlaceList = ({ deleteUserPlace, isCreating, loggedInUser }) => (
  <div>
    <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>
    <UnpaddedList>
      {loggedInUser.savedLocations.map((place, index) => (
        <FavoritePlace
          detailText={place.address || `Set your ${place.type || 'other'} address`}
          icon={place.icon}
          key={index}
          mainText={place.name || place.address}
          onDelete={() => deleteUserPlace(place)}
          path={`${getPlaceBasePath(isCreating)}/${index}`}
          title={'Edit this place'}
        />
      ))}

      <FavoritePlace
        icon='plus'
        mainText='Add another place'
        path={`${getPlaceBasePath(isCreating)}/new`}
        title={''}
      />
    </UnpaddedList>
  </div>
)

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const path = state.router.location.pathname
  const isCreating = path === CREATE_ACCOUNT_PLACES_PATH
  return {
    isCreating,
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  deleteUserPlace: userActions.deleteUserPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlaceList)
