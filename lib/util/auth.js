import { push } from 'connected-react-router'

/**
 * Handle logging out with Auth0 and return to the provided path.
 */
export function logout (path = '') {
  const returnTo = encodeURIComponent(`${getAuthRedirectUri()}${path}`)
  window.location.href = `https://${process.env.AUTH0_DOMAIN}/v2/logout?returnTo=${returnTo}&client_id=${process.env.AUTH0_CLIENT_ID}`
}

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
      if (appState && appState.returnTo) {
        reduxStore.dispatch(push(appState.returnTo))
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
