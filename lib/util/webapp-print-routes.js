import PrintFieldTripLayout from '../components/admin/print-field-trip-layout'
import PrintLayout from '../components/app/print-layout'

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
    component: PrintLayout,
    path: '/print'
  },
  {
    a11yIgnore: true,
    component: PrintFieldTripLayout,
    path: '/printFieldTrip'
  }
]

export default routes
