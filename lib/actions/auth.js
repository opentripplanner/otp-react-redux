import { push } from 'connected-react-router'

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
 * @param {Error} err
 */
export function processSignIn (appState) {
  return function (dispatch, getState) {
    if (appState && appState.urlHash) {
      // At this stage after login, Auth0 has already redirected to /signedin (Auth0-whitelisted)
      // which shows the AfterLoginScreen.
      //
      // Here, we save the URL hash prior to login (contains a combination of itinerary search, stop/trip view, etc.),
      // so that the AfterLoginScreen can redirect back there when logged-in user info is fetched.
      // (For routing, it is easier to deal with the path without the hash sign.)
      const urlHashWithoutHash = (appState.urlHash.split('#')[1] || '/')
      dispatch(setPathBeforeSignIn(urlHashWithoutHash))
    } else if (appState && appState.returnTo) {
      // TODO: Handle other after-login situations.
      // Note that when redirecting from a login-protected (e.g. account) page while logged out,
      //     then returnTo is set by Auth0 to this object format:
      //     {
      //       pathname: "/"
      //       query: { ... }
      //     }
    }
  }
}
