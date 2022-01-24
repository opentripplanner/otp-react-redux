import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import { ControlLabel } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'

import * as userActions from '../../../actions/user'
import { UnpaddedList } from '../../form/styled'
import { CREATE_ACCOUNT_PLACES_PATH } from '../../../util/constants'
import { getPlaceBasePath, isHomeOrWork } from '../../../util/user'

import { FavoritePlace } from './styled'

const { toSentenceCase } = coreUtils.itinerary

/**
 * Renders an editable list user's favorite locations, and lets the user add a new one.
 * Additions, edits, and deletions of places take effect immediately.
 */
const FavoritePlaceList = ({ deleteUserPlace, isCreating, loggedInUser }) => {
  const intl = useIntl()
  const basePath = getPlaceBasePath(isCreating)
  return (
    <div>
      <ControlLabel>
        <FormattedMessage id='components.FavoritePlaceList.description' />
      </ControlLabel>
      <UnpaddedList>
        {loggedInUser.savedLocations.map((place, index) => (
          <FavoritePlace
            detailText={place.address || (
              <FormattedMessage
                id='components.FavoritePlaceList.setAddressForPlaceType'
                values={{
                  placeType: intl.formatMessage({ id: `common.places.${place.type}` })
                }}
              />
            )}
            icon={place.icon}
            key={index}
            // Use toSentenceCase (and not text-transform: capitalize)
            // to change the first char. of the work and home locations only (which come in lowercase).
            mainText={isHomeOrWork(place) ? toSentenceCase(place.name) : (place.name || place.address)}
            onDelete={() => deleteLoggedInUserPlace(place)}
            path={`${basePath}/${index}`}
            title={intl.formatMessage({ id: 'components.FavoritePlaceList.editThisPlace' })}
          />
        ))}

        <FavoritePlace
          icon='plus'
          mainText={<FormattedMessage id='components.FavoritePlaceList.addAnotherPlace' />}
          path={`${basePath}/new`}
          title={''}
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

const mapDispatchToProps = {
  deleteUserPlace: userActions.deleteLoggedInUserPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlaceList)
