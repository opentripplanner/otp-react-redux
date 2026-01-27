import { lazy } from 'react'

import withSuspense from '../components/util/with-suspense'

const TripPreviewLayout = lazy(() =>
  import('../components/app/trip-preview-layout')
)

/**
 * Contains mapping of the component(s) to display for the trip preview URL.
 *
 * Note: This file is separate from webapp-routes to isolate the import of trip preview components
 * (YML file from @opentripplanner/trip-details).
 * that cause build errors during the a11y test.
 */
const routes = [
  {
    a11yIgnore: true,
    component: withSuspense(TripPreviewLayout),
    path: '/previewtrip/:id'
  }
]

export default routes
