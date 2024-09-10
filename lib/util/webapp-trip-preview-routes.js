import TripPreviewLayout from '../components/app/trip-preview-layout'

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
    component: TripPreviewLayout,
    path: '/previewtrip/:id'
  }
]

export default routes
