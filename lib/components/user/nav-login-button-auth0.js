import { useAuth0 } from '@auth0/auth0-react'
import React from 'react'

import { URL_ROOT } from '../../util/constants'
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
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()

  // On login, preserve the current trip query if any.
  // After login, redirect to a whitelisted URL in the Auth0 dashboard.
  const afterLoginPath = '/#/signedin'
  const handleLogin = () => loginWithRedirect({
    redirectUri: `${URL_ROOT}${afterLoginPath}`,
    appState: {urlHash: window.location.hash} // The part of href from #/?, e.g. #/?ui_activeSearch=...
  })
  const handleLogout = () => logout({
    returnTo: URL_ROOT
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
