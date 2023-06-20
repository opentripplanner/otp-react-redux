import { ACCOUNT_PATH } from './constants'
import { isOtpMiddleware } from './user'

/**
 * Custom links under the user account dropdown.
 * TODO: Determine/implement the urls below.
 */
export const accountLinks = (extraMenuItems) => {
  const helpLinkUrl =
    extraMenuItems?.find((link) => link.id === 'help')?.href || '/help'
  return [
    {
      messageId: 'myAccount',
      url: ACCOUNT_PATH
    },
    {
      messageId: 'help',
      // Add a target attribute if you need the link to open in a new window, etc.
      // (supports the same values as <a target=... >).
      // target: '_blank',
      url: helpLinkUrl
    }
  ]
}

/**
 * Obtains the Auth0 {domain, audience, clientId} configuration, if the following applies in config.yml:
 * - persistence.strategy is 'otp_middleware' (and persistence is enabled),
 * - persistence.auth0 is defined.
 * @param persistence The OTP persistence configuration from config.yml.
 * @returns The Auth0 configuration, or null if the conditions are not met.
 */
export function getAuth0Config(persistence) {
  return isOtpMiddleware(persistence) ? persistence.auth0 : null
}
