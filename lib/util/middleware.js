if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

/**
 * This method builds the options object for call to the fetch method.
 * @param {string} accessToken If non-null, a bearer Authorization header will be added with the specified token.
 * @param {string} apiKey If non-null, an x-api-key header will be added with the specified key.
 * @param {string} method The HTTP method to execute.
 * @param {*} options Extra options to pass to fetch.
 */
export function getSecureFetchOptions (accessToken, apiKey, method = 'get', options = {}) {
  const headers = {
    // JSON request bodies only.
    'Content-Type': 'application/json'
  }
  if (apiKey) {
    headers['x-api-key'] = apiKey
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return {
    headers,
    method,
    mode: 'cors', // Middleware is at a different URL.
    ...options
  }
}

/**
 * This convenience method wraps a fetch call to the specified URL
 * with the token and api key added (if provided) to the HTTP request header,
 * and wraps the response by adding the success/error status of the call.
 * @param {string} url The URL to call.
 * @param {string} accessToken If non-null, the Authorization token to add to request header.
 * @param {string} apiKey If non-null, the API key to add to the Authorization header.
 * @param {string} method The HTTP method to execute.
 * @param {*} options Extra options to pass to fetch.
 */
export async function secureFetch (url, accessToken, apiKey, method = 'get', options = {}) {
  const res = await fetch(url, getSecureFetchOptions(accessToken, apiKey, method, options))

  if ((res.status && res.status >= 400) || (res.code && res.code >= 400)) {
    const result = await res.json()
    let message = `Error ${method}-ing user: ${result.message}`
    if (result.detail) message += `  (${result.detail})`

    return {
      message,
      status: 'error'
    }
  }
  return {
    data: await res.json(),
    status: 'success'
  }
}
