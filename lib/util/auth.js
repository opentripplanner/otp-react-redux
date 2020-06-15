import { push } from 'connected-react-router'

import { setPathBeforeSignIn } from '../actions/user'
import { PERSISTENCE_STRATEGY_OTP_MIDDLEWARE } from './constants'

/**
 * Custom links under the user account dropdown.
 * TODO: Determine/implement the urls below.
 */
export const accountLinks = [
  {
    text: 'My Account',
    url: '/account'
  },
  {
    // Add a target attribute if you need the link to open in a new window, etc.
    // (supports the same values as <a target=... >).
    // target: '_blank',
    text: 'Help',
    url: '/help'
  }
]

/**
 * Obtains the Auth0 {domain, audience, clientId} configuration, if the following applies in config.yml:
 * - persistence is defined,
 * - persistence.enabled is true,
 * - persistence.strategy is 'otp_middleware',
 * - persistence.auth0 is defined.
 * @param persistence The OTP persistence configuration from config.yml.
 * @returns The Auth0 configuration, or null if the conditions are not met.
 */
export function getAuth0Config (persistence) {
  if (persistence) {
    const { enabled = false, strategy = null, auth0 = null } = persistence
    return (enabled && strategy === PERSISTENCE_STRATEGY_OTP_MIDDLEWARE) ? auth0 : null
  }
  return null
}

/**
 * Gets the callback methods for Auth0.
 * Note: Methods inside are originally copied from https://github.com/sandrinodimattia/use-auth0-hooks#readme
 * and some methods from that example may still be untouched.
 * @param reduxStore The redux store to carry out the navigation action.
 */
export function getAuth0Callbacks (reduxStore) {
  return {
    /**
     * When it hasn't been possible to retrieve a new access token.
     * @param {Error} err
     * @param {AccessTokenRequestOptions} options
     */
    onAccessTokenError: (err, options) => {
      console.error('Failed to retrieve access token: ', err)
    },
    /**
     * When signing in fails for some reason, we want to show it here.
     * TODO: Implement the error URL.
     * @param {Error} err
     */
    onLoginError: err => {
      if (err) reduxStore.dispatch(push(`/oops`))
    },
    /**
     * Where to send the user after they have signed in.
     */
    onRedirectCallback: appState => {
      if (appState && appState.urlHash) {
        // At this stage after login, Auth0 has already redirected to /signedin (Auth0-whitelisted)
        // which shows the AfterLoginScreen.
        //
        // Here, we save the URL hash prior to login (contains a combination of itinerary search, stop/trip view, etc.),
        // so that the AfterLoginScreen can redirect back there when logged-in user info is fetched.
        // (For routing, it is easier to deal with the path without the hash sign.)
        const urlHashWithoutHash = (appState.urlHash.split('#')[1] || '/')
        reduxStore.dispatch(setPathBeforeSignIn(urlHashWithoutHash))
      } else if (appState && appState.returnTo) {
        // TODO: Handle other after-login situations.
        // Careful!
        // - When redirecting from a login-protected (e.g. account) page while logged out,
        //     then returnTo is set by Auth0 to this object format:
        //     {
        //       pathname: "/"
        //       query: { ... }
        //     }
      }
    },
    /**
     * When redirecting to the login page you'll end up in this state where the login page is still loading.
     * You can render a message to show that the user is being redirected.
     */
    onRedirecting: () => {
      return (
        <div>
          <h1>Signing you in</h1>
          <p>
            In order to access this page you will need to sign in.
            Please wait while we redirect you to the login page...
          </p>
        </div>
      )
    }
  }
}
