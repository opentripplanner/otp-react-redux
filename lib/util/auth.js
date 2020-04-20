
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
