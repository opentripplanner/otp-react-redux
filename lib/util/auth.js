import { ACCOUNT_PATH, PERSISTENCE_STRATEGY_OTP_MIDDLEWARE } from './constants'

/**
 * Custom links under the user account dropdown.
 * TODO: Determine/implement the urls below.
 */
export const accountLinks = [
  {
    text: 'My account',
    url: ACCOUNT_PATH
  },
  {
    // Add a target attribute if you need the link to open in a new window, etc.
    // (supports the same values as <a target=... >).
    // target: '_blank',
    text: 'Help',
    url: '/help'
  }
]

/**
 * Obtains the Auth0 {domain, audience, clientId} configuration, if the following applies in config.yml:
 * - persistence is defined,
 * - persistence.enabled is true,
 * - persistence.strategy is 'otp_middleware',
 * - persistence.auth0 is defined.
 * @param persistence The OTP persistence configuration from config.yml.
 * @returns The Auth0 configuration, or null if the conditions are not met.
 */
export function getAuth0Config (persistence) {
  if (persistence) {
    const { enabled = false, strategy = null, auth0 = null } = persistence
    return (enabled && strategy === PERSISTENCE_STRATEGY_OTP_MIDDLEWARE) ? auth0 : null
  }
  return null
}
