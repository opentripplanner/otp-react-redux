import { push } from 'connected-react-router'

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
    text: 'Help',
    url: '/help'
  }
]

export const getAuthRedirectUri = () => {
  if (typeof window !== 'undefined') {
    const url = `${window.location.protocol}//${window.location.host}`
    console.log(url)
    return url
  }
  return 'http://localhost:9966'
}

/**
 * Obtains the Auth0 {domain, audience, clientId} configuration, if the following applies in config.yml:
 * - persistence is defined,
 * - persistence.enabled is true,
 * - persistence.strategy is defined and is not 'localStorage',
 * - persistence.auth0 is defined.
 * @param otpConfig The OTP configuration params from config.yml.
 * @returns The Auth0 configuration, or null if the conditions are not met.
 */
export function getAuth0Config (otpConfig) {
  const { persistence } = otpConfig
  if (persistence) {
    const { enabled = false, strategy = null, auth0 = null } = persistence
    return (enabled && strategy && strategy !== 'localStorage') ? auth0 : null
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
        /**
         * Immediately after successful login, Auth0 will redirect to a URL (in whitelist) with no search parameters.
         * If the user has set up their MOD UI account, we want to redirect to
         * the state just before the Auth0 operation (stored in appState.urlHash),
         * and prevent the URL with no search from appearing in the user's browsing history.
         */

        const newUserPath = appState.urlHash.replace('#/', '#/account/welcome')
        const newUserUrl = `${getAuthRedirectUri()}${newUserPath}`
        window.location.replace(newUserUrl)
      } else if (appState && appState.returnTo) {
        // TODO: Handle other after-login situations.
        /**
         * Careful!
         * - When redirecting from a login-protected page while logged out,
         *     then returnTo is set by Auth0 to this object format:
         *     {
         *       pathname: "/"
         *       query: { ... }
         *     }
         */
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
