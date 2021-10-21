import React from 'react'
import { FormattedMessage } from 'react-intl'

/**
 * This screen is flashed just before the Auth0 login page is shown.
 * TODO: improve this screen.
 */
const BeforeSignInScreen = () => (
  <div>
    <h1>
      <FormattedMessage id='components.BeforeSignInScreen.mainTitle' />
    </h1>
    <p>
      <FormattedMessage id='components.BeforeSignInScreen.message' />
    </p>
  </div>
)

export default BeforeSignInScreen
