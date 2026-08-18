import React, { lazy } from 'react'

import { frame } from '../components/app/app-frame'
import RedirectWithQuery from '../components/form/redirect-with-query'
import withSuspense from '../components/util/with-suspense'

import {
  ACCOUNT_PATH,
  ACCOUNT_SETTINGS_PATH,
  CREATE_ACCOUNT_PATH,
  CREATE_ACCOUNT_PLACES_PATH,
  CREATE_ACCOUNT_VERIFY_PATH,
  MOBILITY_PATH,
  PLACES_PATH,
  TERMS_OF_SERVICE_PATH,
  TERMS_OF_STORAGE_PATH,
  TRIPS_PATH
} from './constants'

const SavedTripScreen = lazy(() =>
  import('../components/user/monitored-trip/saved-trip-screen')
)
const UserAccountScreen = lazy(() =>
  import('../components/user/user-account-screen')
)
const FavoritePlaceScreen = lazy(() =>
  import('../components/user/places/favorite-place-screen')
)
const SavedTripList = lazy(() =>
  import('../components/user/monitored-trip/saved-trip-list')
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
    component: withSuspense(FavoritePlaceScreen),
    path: [`${CREATE_ACCOUNT_PLACES_PATH}/:id`, `${PLACES_PATH}/:id`]
  },
  {
    a11yIgnore: true,
    component: withSuspense(SavedTripScreen),
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
    component: withSuspense(UserAccountScreen),
    path: [
      `${CREATE_ACCOUNT_PATH}/:step`,
      `${MOBILITY_PATH}/:step`,
      `${MOBILITY_PATH}/`,
      ACCOUNT_SETTINGS_PATH
    ]
  },
  {
    getContextComponent: (components) => frame(components.TermsOfService),
    path: TERMS_OF_SERVICE_PATH
  },
  {
    getContextComponent: (components) => frame(components.TermsOfStorage),
    path: TERMS_OF_STORAGE_PATH
  },
  {
    a11yIgnore: true,
    component: withSuspense(SavedTripList),
    path: TRIPS_PATH
  }
]

export default routes
