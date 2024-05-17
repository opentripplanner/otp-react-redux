import React, { lazy, Suspense } from 'react'

import RedirectWithQuery from '../components/form/redirect-with-query'
import SavedTripList from '../components/user/monitored-trip/saved-trip-list'

import {
  ACCOUNT_PATH,
  ACCOUNT_SETTINGS_PATH,
  CREATE_ACCOUNT_PATH,
  CREATE_ACCOUNT_PLACES_PATH,
  CREATE_ACCOUNT_VERIFY_PATH,
  MOBILITY_PATH,
  PLACES_PATH,
  TRIPS_PATH
} from './constants'

/*

Handles for the following routes, basically /account/*:
/account
/account/trips
/account/trips/:id
/account/create/verify
/account/create
/account/create/:id
/account/create/places/:id
/account/mobilityProfile
/account/mobilityProfile/:id
/account/settings
/account/places/:id
*/

const SavedTripScreen = lazy(() =>
  import('../components/user/monitored-trip/saved-trip-screen')
)
const UserAccountScreen = lazy(() =>
  import('../components/user/user-account-screen')
)
const FavoritePlaceScreen = lazy(() =>
  import('../components/user/places/favorite-place-screen')
)

/**
 * Contains mapping of the component(s) to display for each URL route.
 *
 * Note: This object is moved out of ResponsiveWebApp to avoid an error importing
 * a YML file from @opentripplanner/trip-details during the a11y build/test.
 */
// TODO: A number of these routes are ignored during a11y testing as no server mocks are available
const routes = [
  {
    a11yIgnore: true,
    component: (props) => (
      <Suspense fallback={<span />}>
        <FavoritePlaceScreen {...props} />
      </Suspense>
    ),
    path: [`${CREATE_ACCOUNT_PLACES_PATH}/:id`, `${PLACES_PATH}/:id`]
  },
  {
    a11yIgnore: true,
    component: (props) => (
      <Suspense fallback={<span />}>
        <SavedTripScreen {...props} />
      </Suspense>
    ),
    path: `${TRIPS_PATH}/:id`
  },
  {
    a11yIgnore: true,
    children: <RedirectWithQuery to={TRIPS_PATH} />,
    exact: true,
    path: ACCOUNT_PATH
  },
  {
    a11yIgnore: true,
    children: <RedirectWithQuery to={CREATE_ACCOUNT_VERIFY_PATH} />,
    exact: true,
    path: CREATE_ACCOUNT_PATH
  },
  {
    a11yIgnore: true,
    // This route lets new or existing users edit or set up their account.
    component: (props) => (
      <Suspense fallback={<span />}>
        <UserAccountScreen {...props} />
      </Suspense>
    ),
    path: [
      `${CREATE_ACCOUNT_PATH}/:step`,
      `${MOBILITY_PATH}/:step`,
      `${MOBILITY_PATH}/`,
      ACCOUNT_SETTINGS_PATH
    ]
  },
  {
    a11yIgnore: true,
    component: SavedTripList,
    path: TRIPS_PATH
  }
]

export default routes
