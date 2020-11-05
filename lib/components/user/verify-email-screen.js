import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as userActions from '../../actions/user'

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
  _handleResendVerificationEmail = () => {
    const { auth0, resendVerificationEmail } = this.props
    resendVerificationEmail(auth0)
  }

  _handleClick = () => window.location.reload()

  render () {
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

        <DivSpacer space={1.5}>
          <Button
            bsStyle='link'
            onClick={this._handleResendVerificationEmail}
            style={{padding: '0px'}}
          >
            Resend verification email
          </Button>
        </DivSpacer>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = {
  resendVerificationEmail: userActions.resendVerificationEmail
}

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmailScreen)
