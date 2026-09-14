import { lazy } from 'react'

import AfterSignInScreen from '../components/user/after-signin-screen'
import withSuspense from '../components/util/with-suspense'

import { ACCOUNT_PATH } from './constants'

const AccountRoute = lazy(() => import('../components/user/account-route'))

/**
 * Contains mapping of the component(s) to display for each URL route.
 * Note: These routes are ignored during a11y testing as no server mocks are available.
 */
const routes = [
  {
    a11yIgnore: true,
    // This route is called immediately after login by Auth0
    // and by the onRedirectCallback function from /lib/util/auth.js.
    // For new users, it displays the account setup form.
    // For existing users, it takes the browser back to the itinerary search prior to login.
    component: AfterSignInScreen,
    path: '/signedin'
  },
  {
    a11yIgnore: true,
    component: withSuspense(AccountRoute),
    path: ACCOUNT_PATH
  }
]

export default routes
