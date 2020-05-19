import React from 'react'
import FontAwesome from 'react-fontawesome'

/**
 * Screen that is flashed just after user sign in.
 * TODO: Improve this screen.
 */
const AfterSignIn = () => (
  <div>
    <h1>Signed In...
      <br />
      <FontAwesome
        name='hourglass-half'
        size='4x'
      />
    </h1>
  </div>
)

export default AfterSignIn
