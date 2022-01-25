/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { ControlLabel } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'

import * as userActions from '../../../actions/user'
import { CREATE_ACCOUNT_PLACES_PATH } from '../../../util/constants'
import {
  getPlaceBasePath,
  getPlaceDetail,
  getPlaceMainText
} from '../../../util/user'
import { UnpaddedList } from '../../form/styled'

import { FavoritePlace } from './styled'

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 * Additions, edits, and deletions of places take effect immediately.
 */
const FavoritePlaceList = ({
  deleteLoggedInUserPlace,
  isCreating,
  loggedInUser
}) => {
  const intl = useIntl()
  const basePath = getPlaceBasePath(isCreating)
  return (
    <div>
      <ControlLabel>
        <FormattedMessage id="components.FavoritePlaceList.description" />
      </ControlLabel>
      <UnpaddedList>
        {loggedInUser.savedLocations.map((place, index) => (
          <FavoritePlace
            detailText={getPlaceDetail(place, intl, true)}
            icon={place.icon}
            key={index}
            mainText={getPlaceMainText(place, intl, true)}
            onDelete={() => deleteLoggedInUserPlace(place)}
            path={`${basePath}/${index}`}
            title={intl.formatMessage({
              id: 'components.FavoritePlaceList.editThisPlace'
            })}
          />
        ))}

        <FavoritePlace
          icon="plus"
          mainText={
            <FormattedMessage id="components.FavoritePlaceList.addAnotherPlace" />
          }
          path={`${basePath}/new`}
          title=""
        />
      </UnpaddedList>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state) => {
  const path = state.router.location.pathname
  const isCreating = path === CREATE_ACCOUNT_PLACES_PATH
  return {
    isCreating,
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  deleteLoggedInUserPlace: userActions.deleteLoggedInUserPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlaceList)
