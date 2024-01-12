/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { CREATE_ACCOUNT_TERMS_PATH } from '../../util/constants'

import DeleteUser from './delete-user'

const DivSpacer = styled.div`
  margin-top: ${(props) => props.space || 2}em;
`

/**
 * This component contains the prompt for the user to verify their email address.
 * It also contains a button that lets the user finish account setup.
 *
 * (One way to make sure the parent page fetches the latest email verification status
 * is to simply reload the page.)
 */
class VerifyEmailPane extends Component {
  _handleEmailVerified = () => window.location.reload()

  _handleResend = () => {
    const { intl, resendVerificationEmail } = this.props
    resendVerificationEmail(intl)
  }

  componentDidMount() {
    const { emailVerified, routeTo } = this.props
    if (emailVerified) {
      // If the user got to this screen, it is assumed they just signed up,
      // so once their email is verified, automatically go to the
      // next screen, which is the terms page.
      routeTo(CREATE_ACCOUNT_TERMS_PATH)
    }
  }

  render() {
    return (
      <div>
        <p>
          <FormattedMessage id="components.VerifyEmailPane.instructions1" />
        </p>
        <p>
          <FormattedMessage id="components.VerifyEmailPane.instructions2" />
        </p>
        <DivSpacer>
          <Button
            bsSize="large"
            bsStyle="primary"
            onClick={this._handleEmailVerified}
          >
            <FormattedMessage id="components.VerifyEmailPane.emailIsVerified" />
          </Button>
        </DivSpacer>

        <DivSpacer space={1.5}>
          <Button
            bsStyle="link"
            onClick={this._handleResend}
            style={{ padding: '0px' }}
          >
            <FormattedMessage id="components.VerifyEmailPane.resendVerification" />
          </Button>
        </DivSpacer>

        <DivSpacer space={3}>
          <DeleteUser />
        </DivSpacer>
      </div>
    )
  }
}

// connect to the redux store

const mapDispatchToProps = {
  resendVerificationEmail: userActions.resendVerificationEmail,
  routeTo: uiActions.routeTo
}

export default connect(null, mapDispatchToProps)(injectIntl(VerifyEmailPane))
