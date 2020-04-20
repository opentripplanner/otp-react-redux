
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
