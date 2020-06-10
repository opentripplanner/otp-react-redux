import React from 'react'

import Auth0Wrapper from './auth0-wrapper'
import UserLoaderScreen from './user-loader-screen'

/**
 * This component ensures that state.otpUser is loaded
 * for any wrapped component that may need it.
 */
const withLoggedInUserSupport = (ChildComponent, requireLoggedInUser) =>
  props => (
    <Auth0Wrapper showAwaitingScreen={requireLoggedInUser}>
      <UserLoaderScreen requireLoggedInUser={requireLoggedInUser}>
        <ChildComponent {...props} />
      </UserLoaderScreen>
    </Auth0Wrapper>
  )

export default withLoggedInUserSupport
