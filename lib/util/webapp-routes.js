import AfterSignInScreen from '../components/user/after-signin-screen'

/**
 * Contains mapping of the component(s) to display for each URL route.
 *
 * Note: This object is moved out of ResponsiveWebApp to avoid an error importing
 * a YML file from @opentripplanner/trip-details during the a11y build/test.
 */
// TODO: A number of these routes are ignored during a11y testing as no server mocks are available
const routes = [
  {
    exact: true,
    path: [
      // App root
      '/',
      // Load app with preset lat/lon/zoom and optional router
      // NOTE: All params will be cast to :id in matchContentToUrl due
      // to a quirk with react-router.
      // https://github.com/ReactTraining/react-router/issues/5870#issuecomment-394194338
      '/@/:latLonZoomRouter',
      '/start/:latLonZoomRouter',
      // Route viewer (and route ID).
      '/route',
      '/route/:id',
      '/route/:id/pattern/:patternId',
      // Stop viewer (and stop ID).
      '/schedule',
      '/schedule/:id',
      // Nearby View
      '/nearby',
      '/nearby/:latLon',
      // Trip Viewer
      '/trip/:id'
    ],
    shouldRenderWebApp: true
  },
  {
    a11yIgnore: true,
    // This route is called immediately after login by Auth0
    // and by the onRedirectCallback function from /lib/util/auth.js.
    // For new users, it displays the account setup form.
    // For existing users, it takes the browser back to the itinerary search prior to login.
    component: AfterSignInScreen,
    path: '/signedin'
  }
]

export default routes
