import React from 'react'

import Auth0Wrapper from './auth0-wrapper'
import UserLoaderScreen from './user-loader-screen'

const WithLoggedInUser = props => {
  const { children } = props

  return (
    <Auth0Wrapper>
      <UserLoaderScreen>
        {children}
      </UserLoaderScreen>
    </Auth0Wrapper>
  )
}

export default WithLoggedInUser
