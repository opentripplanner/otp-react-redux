/**
 * @param {*} string the string to test.
 * @returns true if the string is null or of zero length.
 */
export function isBlank (string) {
  return !(!!string && string.length)
}

/**
 * Returns the route that is in place before a user accesses the login page,
 * e.g. if the URL is http://www.example.com/path/#/route?param=value,
 * only /route?param=value is returned. A blank string is returned at the minimum per substr() function.
 */
export function getCurrentRoute () {
  return window.location.hash.substr(1)
}

/**
 * Used in several components instantiated with auth0-react's withAuthenticationRequired(),
 * so that the browser returns to the route (hash) in place before the user accessed the login page,
 * e.g. /account/?ui_activeSearch=... without #.
 */
export const RETURN_TO_CURRENT_ROUTE = {
  returnTo: getCurrentRoute
}
