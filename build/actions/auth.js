"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showAccessTokenError = showAccessTokenError;
exports.showLoginError = showLoginError;
exports.processSignIn = processSignIn;

var _connectedReactRouter = require("connected-react-router");

var _user = require("../actions/user");

/**
 * This function is called by the Auth0Provider component, with the described parameter(s),
 * when a new access token could not be retrieved.
 * @param {Error} err
 * @param {AccessTokenRequestOptions} options
 */
function showAccessTokenError(err, options) {
  return function (dispatch, getState) {
    // TODO: improve this.
    console.error('Failed to retrieve access token: ', err);
  };
}
/**
 * This function is called by the Auth0Provider component, with the described parameter(s),
 * when signing-in fails for some reason.
 * @param {Error} err
 */


function showLoginError(err) {
  return function (dispatch, getState) {
    // TODO: improve this.
    if (err) dispatch((0, _connectedReactRouter.push)('/oops'));
  };
}
/**
 * This function is called by the Auth0Provider component, with the described parameter(s),
 * after the user signs in.
 * @param {Object} appState The state that was stored when calling useAuth().login().
 */


function processSignIn(appState) {
  return function (dispatch, getState) {
    if (appState && appState.urlHash) {
      // At this stage after login, Auth0 has already redirected to /signedin (Auth0-whitelisted)
      // which shows the AfterLoginScreen.
      //
      // Here, we save the URL hash prior to login (contains a combination of itinerary search, stop/trip view, etc.),
      // so that the AfterLoginScreen can redirect back there when logged-in user info is fetched.
      // (For routing, it is easier to deal with the path without the hash sign.)
      var hashIndex = appState.urlHash.indexOf('#');
      var urlHashWithoutHash = hashIndex >= 0 ? appState.urlHash.substr(hashIndex + 1) : '/';
      dispatch((0, _user.setPathBeforeSignIn)(urlHashWithoutHash));
    } else if (appState && appState.returnTo) {// TODO: Handle other after-login situations.
      // Note that when redirecting from a login-protected (e.g. account) page while logged out,
      //     then returnTo is set by Auth0 to this object format:
      //     {
      //       pathname: "/"
      //       query: { ... }
      //     }
    }
  };
}

//# sourceMappingURL=auth.js