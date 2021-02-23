import { ACCOUNT_PATH, PERSIST_TO_OTP_MIDDLEWARE } from './constants'
import { getPersistenceStrategy } from './user'

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
 * - persistence.strategy is 'otp_middleware' (and persistence is enabled),
 * - persistence.auth0 is defined.
 * @param persistence The OTP persistence configuration from config.yml.
 * @returns The Auth0 configuration, or null if the conditions are not met.
 */
export function getAuth0Config (persistence) {
  return getPersistenceStrategy(persistence) === PERSIST_TO_OTP_MIDDLEWARE
    ? persistence.auth0
    : null
}
