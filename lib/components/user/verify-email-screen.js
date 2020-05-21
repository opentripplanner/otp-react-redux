import React from 'react'
import { Button } from 'react-bootstrap'

const _handleClick = () => window.location.reload()

/**
 * This component contains the prompt for the user to verify their email address.
 * It also contains a button that lets the user finish account setup.
 *
 * (One way to make sure the parent page fetches the latest email verification status
 * is to simply reload the page.)
 */
const verifyEmailScreen = (
  <div>
    <h1>Verify your email address</h1>
    <p>
      Please check your email inbox and follow the link in the message
      to verify your email address before finishing your account setup.
    </p>
    <p>
      Once you're verified, click the button below to continue.
    </p>

    <Button
      bsSize='large'
      bsStyle='primary'
      onClick={_handleClick}
    >
      My email is verified!
    </Button>
  </div>
)

export default verifyEmailScreen
