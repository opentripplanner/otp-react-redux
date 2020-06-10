import React from 'react'

import Auth0Wrapper from './auth0-wrapper'
import UserLoaderScreen from './user-loader-screen'

/**
 * This component wraps around other components that need to access
 * state.otpUser.loggedInUser.
 */
const supportLoggedInUser = (content, loggedInUserRequired) => (
  <Auth0Wrapper showAwaitingScreen={loggedInUserRequired}>
    <UserLoaderScreen loggedInUserRequired={loggedInUserRequired}>
      {content}
    </UserLoaderScreen>
  </Auth0Wrapper>
)

export default supportLoggedInUser
