import { useAuth0 } from '@auth0/auth0-react'
import React from 'react'

import { getCurrentRoute } from '../../util/ui'

import NavLoginButton from './nav-login-button'

type AccountLink = {
  messageId: string
  url: string
}

interface NavLoginButtonAuth0Props {
  className?: string
  id: string
  links: Array<AccountLink>
  style?: { [key: string]: any }
}

/**
 * This component wraps NavLoginButton with Auth0 information.
 */
const NavLoginButtonAuth0 = ({
  className,
  id,
  links,
  style
}: NavLoginButtonAuth0Props) => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()

  // On login, preserve the current trip query if any.
  const handleLogin = () =>
    loginWithRedirect({
      appState: { returnTo: getCurrentRoute() }
    })
  const handleLogout = () =>
    logout({
      // Logout to the map with no search.
      returnTo: window.location.origin
    })

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
