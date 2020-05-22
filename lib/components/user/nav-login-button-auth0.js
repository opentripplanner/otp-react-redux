import React from 'react'
import { useAuth } from 'use-auth0-hooks'

import { getAuthRedirectUri } from '../../util/auth'

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

  // On login, preserve the current trip query if any.
  // TODO: check that URLs are whitelisted. All trip query URLs in /#/ are.
  const afterLoginPath = '/#/signedin'
  const handleLogin = () => login({
    redirect_uri: `${getAuthRedirectUri()}${afterLoginPath}`,
    appState: {urlHash: window.location.hash} // The part of href from #/?, e.g. #/?ui_activeSearch=...
  })

  // On logout, it is better to "clear" the screen, so
  // return to redirectUri set in <Auth0Provider> (no specific event handler).

  return (
    <NavLoginButton
      className={className}
      id={id}
      links={links}
      onSignInClick={handleLogin}
      onSignOutClick={logout}
      profile={isAuthenticated ? user : null}
      style={style}
    />
  )
}

export default NavLoginButtonAuth0
