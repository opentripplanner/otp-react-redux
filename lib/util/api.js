if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

/**
 * Gets JSON from a response object.
 * If the response contains an error code, logs the error in the console and throw exception.
 * @param {*} res The HTTP response object.
 */
export function getJsonAndCheckResponse (res) {
  if (res.status >= 400) {
    const error = new Error('Received error from server')
    error.response = res
    throw error
  }
  return res.json()
}
