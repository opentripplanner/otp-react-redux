if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

const API_USER_PATH = '/api/secure/user'

export async function secureFetch (url, accessToken, apiKey, method = 'get', options = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-api-key': apiKey
    },
    ...options
  })
  if (res.status >= 400) {
    const result = await res.json()
    let message = `Error ${method}-ing user: ${result.message}`
    if (result.detail) message += `  (${result.detail})`

    console.log(message)
    return {
      status: 'error',
      message
    }
  }
  return {
    status: 'success',
    data: await res.json()
  }
}

export async function fetchUser (middlewareConfig, idField, id, token) {
  const { apiBaseUrl, apiKey } = middlewareConfig
  const requestUrl = `${apiBaseUrl}${API_USER_PATH}/find/${idField}/${id}`

  return secureFetch(requestUrl, token, apiKey)
}

export async function addUser (middlewareConfig, token, data) {
  const { apiBaseUrl, apiKey } = middlewareConfig
  const requestUrl = `${apiBaseUrl}${API_USER_PATH}`

  return secureFetch(requestUrl, token, apiKey, 'POST', {
    body: JSON.stringify(data)
  })
}

export async function updateUser (middlewareConfig, token, data) {
  const { apiBaseUrl, apiKey } = middlewareConfig
  const { id } = data // Middleware ID, NOT auth0 (or similar) id.
  const requestUrl = `${apiBaseUrl}${API_USER_PATH}/${id}`

  if (id) {
    return secureFetch(requestUrl, token, apiKey, 'PUT', {
      body: JSON.stringify(data)
    })
  } else {
    return {
      status: 'error',
      message: 'Corrupted state: User ID not available for exiting user.'
    }
  }
}
