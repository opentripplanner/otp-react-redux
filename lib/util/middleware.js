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
    return null // window.alert(message)
  }
  return res.json()
}

export async function fetchUser (middlewareConfig, idField, id, token) {
  const { apiBaseUrl, apiKey } = middlewareConfig
  const requestUrl = `${apiBaseUrl}${API_USER_PATH}/find/${idField}/${id}`

  return secureFetch(requestUrl, token, apiKey)
}
