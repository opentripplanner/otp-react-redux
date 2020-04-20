import React from 'react'

// Login classes
import { useAuth } from 'use-auth0-hooks'
import { getAuthRedirectUri } from '../../util/auth'

import NavLoginButton from './nav-login-button'

/**
 * This component wraps NavLoginButton with Auth0 information.
 */
export default function NavLoginButtonAuth0 (props) {
  const { isAuthenticated, login, logout, user } = useAuth()

  const handleLogin = () => login({ appState: { returnTo: window.location.href } })
  const handleLogout = () => logout({ returnTo: getAuthRedirectUri() })

  return (
    <NavLoginButton
      {...props}
      onSignInClick={handleLogin}
      onSignOutClick={handleLogout}
      profile={isAuthenticated ? user : null}
    />
  )
}
