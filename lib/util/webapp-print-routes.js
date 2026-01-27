import { lazy } from 'react'

import withSuspense from '../components/util/with-suspense'

const PrintLayout = lazy(() => import('../components/app/print-layout'))

const PrintFieldTripLayout = lazy(() =>
  import('../components/admin/print-field-trip-layout')
)

/**
 * Contains mapping of the component(s) to display for each URL printing route.
 *
 * Note: This file is separate from webapp-routes to isolate the import of printing components
 * (YML file from @opentripplanner/trip-details).
 * that cause build errors during the a11y test.
 */
const routes = [
  {
    a11yIgnore: true,
    component: withSuspense(PrintLayout),
    path: '/print'
  },
  {
    a11yIgnore: true,
    component: withSuspense(PrintFieldTripLayout),
    path: '/printFieldTrip'
  }
]

export default routes
