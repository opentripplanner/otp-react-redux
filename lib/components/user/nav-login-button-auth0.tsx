import { useAuth0 } from '@auth0/auth0-react'
import React, { HTMLAttributes, useCallback } from 'react'

import { getCurrentRoute } from '../../util/ui'

import NavLoginButton from './nav-login-button'

type AccountLink = {
  messageId: string
  url: string
}

interface NavLoginButtonAuth0Props extends HTMLAttributes<HTMLElement> {
  id: string
  links: Array<AccountLink>
  locale: string
}

/**
 * This component wraps NavLoginButton with Auth0 information.
 */
const NavLoginButtonAuth0 = ({
  className,
  id,
  links,
  locale,
  style
}: NavLoginButtonAuth0Props): JSX.Element => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()

  // For Chinese (Chinese (Simplified)), we must pass 'zh-CN' to auth0.
  // Unlike 'fr', 'zh' alone is not recognized and falls back to English.
  const auth0Locale = locale === 'zh' ? 'zh-CN' : locale

  // On login, preserve the current trip query if any.
  const handleLogin = useCallback(
    () =>
      loginWithRedirect({
        appState: { returnTo: getCurrentRoute() },
        ui_locales: auth0Locale
      }),
    [auth0Locale, loginWithRedirect]
  )
  const handleLogout = useCallback(
    () =>
      logout({
        // Logout to the map with no search.
        returnTo: window.location.origin
      }),
    [logout]
  )

  // On logout, it is better to "clear" the screen, so
  // return to redirectUri set in <Auth0Provider> (no specific event handler).

  return (
    <NavLoginButton
      className={className}
      id={id}
      links={links}
      onSignInClick={handleLogin}
      onSignOutClick={handleLogout}
      profile={isAuthenticated ? user : null}
      style={style}
    />
  )
}

export default NavLoginButtonAuth0
