import { replace, push } from 'connected-react-router'

import { setPathBeforeSignIn } from '../actions/user'

/**
 * This function is called by the Auth0Provider component, with the described parameter(s),
 * when a new access token could not be retrieved.
 * @param {Error} err
 * @param {AccessTokenRequestOptions} options
 */
export function showAccessTokenError (err, options) {
  return function (dispatch, getState) {
    // TODO: improve this.
    console.error('Failed to retrieve access token: ', err)
  }
}

/**
 * This function is called by the Auth0Provider component, with the described parameter(s),
 * when signing-in fails for some reason.
 * @param {Error} err
 */
export function showLoginError (err) {
  return function (dispatch, getState) {
    // TODO: improve this.
    if (err) dispatch(push('/oops'))
  }
}

/**
 * This function is called by the Auth0Provider component, with the described parameter(s),
 * after the user signs in.
 * @param {Object} appState The state stored when calling useAuth0().loginWithRedirect
 * or when instantiating a component that uses withAuhenticationRequired.
 */
export function processSignIn (appState) {
  return function (dispatch, getState) {
    if (appState && appState.returnTo) {
      // Remove URL parameters that were added by auth0-react
      // (see https://github.com/auth0/auth0-react/blob/adac2e810d4f6d33253cb8b2016fcedb98a3bc16/examples/cra-react-router/src/index.tsx#L7).
      window.history.replaceState({}, '', window.location.pathname)

      // Here, we add the hash to the redux state (portion of the URL after '#' that contains the route/page name e.g. /account,
      // and includes a combination of itinerary search, stop/trip view, etc.) that was passed to appState.returnTo prior to login.
      // Once the redux state set, we redirect to the "/signedin" route (whitelisted in Auth0 dashboard), where the AfterLoginScreen
      // will in turn fetch the user data then redirect the web browser back to appState.returnTo.
      dispatch(setPathBeforeSignIn(appState.returnTo))
      dispatch(replace('/signedin'))
    }
  }
}
