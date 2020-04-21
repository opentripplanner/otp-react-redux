import React from 'react'
import { useAuth } from 'use-auth0-hooks'

import NavLoginButton from './nav-login-button'

/**
 * This component wraps NavLoginButton with Auth0 information.
 */
export default function NavLoginButtonAuth0 (props) {
  const { isAuthenticated, login, logout, user } = useAuth()

  const handleLogin = () => login({ appState: {returnTo: window.location.href} })
  const handleLogout = () => logout({ returnTo: window.location.href })

  return (
    <NavLoginButton
      {...props}
      onSignInClick={handleLogin}
      onSignOutClick={handleLogout}
      profile={isAuthenticated ? user : null}
    />
  )
}
