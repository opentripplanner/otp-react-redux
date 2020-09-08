import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

import { secureFetch } from '../../util/middleware'

const DivSpacer = styled.div`
  margin-top: ${props => props.space || 2}em;
`

/**
 * This component contains the prompt for the user to verify their email address.
 * It also contains a button that lets the user finish account setup.
 *
 * (One way to make sure the parent page fetches the latest email verification status
 * is to simply reload the page.)
 */
class VerifyEmailScreen extends Component {
  resendVerificationEmail = () => {
    const { auth, middlewareConfig } = this.props
    const { accessToken } = auth
    if (!accessToken) {
      console.warn('No access token found.')
      return
    }
    const { apiBaseUrl, apiKey } = middlewareConfig

    secureFetch(`${apiBaseUrl}/api/secure/user/verification-email`, accessToken, apiKey)
      .then(json => window.alert('Verification email resent!'))
      // TODO: check status of the request.
  }

  _handleClick = () => window.location.reload()

  render () {
    const { middlewareConfig } = this.props
    return (
      <div>
        <h1>Verify your email address</h1>
        <DivSpacer>
          Please check your email inbox and follow the link in the message
          to verify your email address before finishing your account setup.
        </DivSpacer>
        <p>
          Once you're verified, click the button below to continue.
        </p>
        <DivSpacer>
          <Button
            bsSize='large'
            bsStyle='primary'
            onClick={this._handleClick}
          >
            My email is verified!
          </Button>
        </DivSpacer>

        {middlewareConfig && (
          <DivSpacer space={1.5}>
            <Button
              bsStyle='link'
              onClick={this.resendVerificationEmail}
              style={{padding: '0px'}}
            >
              Resend verification email
            </Button>
          </DivSpacer>
        )}
      </div>
    )
  }
}

export default VerifyEmailScreen
