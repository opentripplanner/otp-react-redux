import React from 'react'
import { useAuth } from 'use-auth0-hooks'

import NavLoginButton from './nav-login-button'

/**
 * This component wraps NavLoginButton with Auth0 information.
 */
const NavLoginButtonAuth0 = ({
  className,
  id,
  links,
  style
}) => {
  const { isAuthenticated, login, logout, user } = useAuth()

  const handleLogin = () => login({ appState: {returnTo: window.location.href} })
  const handleLogout = () => logout({ returnTo: window.location.href })

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
