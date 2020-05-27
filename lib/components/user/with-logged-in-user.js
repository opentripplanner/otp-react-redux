import React from 'react'

import Auth0Wrapper from './auth0-wrapper'
import UserLoaderScreen from './user-loader-screen'

/**
 * This component wraps around other components that need to access
 * state.otp.user,loggedInUser.
 */
const withLoggedInUser = content => (
  <Auth0Wrapper>
    <UserLoaderScreen>
      {content}
    </UserLoaderScreen>
  </Auth0Wrapper>
)

export default withLoggedInUser
