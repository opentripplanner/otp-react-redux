import { Label as BsLabel, FormGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
// @ts-expect-error Package does not have type declaration
import { formatPhoneNumber } from 'react-phone-number-input'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import React, { Component, createRef, Fragment } from 'react'
import styled from 'styled-components'

import * as userActions from '../../actions/user'
import { AppReduxState } from '../../util/state-types'
import { getAriaPhoneNumber } from '../../util/a11y'
import { GRAY_ON_WHITE } from '../util/colors'
import { isBlank } from '../../util/ui'
import { PhoneFormatConfig } from '../../util/config-types'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

import { ControlStrip } from './styled'
import PhoneChangeForm, { PhoneChangeSubmitHandler } from './phone-change-form'
import PhoneVerificationForm, {
  PhoneVerificationSubmitHandler
} from './phone-verification-form'

const PlainLink = styled.a`
  color: ${GRAY_ON_WHITE};
  &:hover {
    text-decoration: none;
  }
`

const blankState = {
  isEditing: false,
  phoneNumberReceived: false,
  phoneNumberVerified: false,
  submittedCode: '',
  submittedNumber: ''
}

interface Props {
  descriptorId: string
  initialPhoneNumber?: string
  initialPhoneNumberVerified?: boolean
  intl: IntlShape
  phoneFormatOptions: PhoneFormatConfig
  requestPhoneVerificationSms: (phoneNum: string, intl: IntlShape) => void
  verifyPhoneNumber: (code: string, intl: IntlShape) => void
}

interface State {
  /** If true, phone number is being edited. */
  isEditing: boolean
  /** Alert for when a phone number was successfully received. */
  phoneNumberReceived: boolean
  /** Alert for when a phone number was successfully verified. */
  phoneNumberVerified: boolean
  /** Holds the submitted validation code. */
  submittedCode: string
  /** Holds the new phone number (+15555550123 format) submitted for verification. */
  submittedNumber: string
}

function getInitialState({
  initialPhoneNumber,
  initialPhoneNumberVerified = false
}: Props): State {
  return {
    ...blankState,
    // For new users, render component in editing state.
    isEditing: isBlank(initialPhoneNumber),
    phoneNumberVerified: initialPhoneNumberVerified
  }
}

/**
 * Sub-component that handles phone number and validation code editing and validation intricacies.
 */
class PhoneNumberEditor extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = getInitialState(props)
  }

  _changeRef = createRef<HTMLButtonElement>()

  _handleEditNumber = () => this.setState({ isEditing: true })

  _handleCancelEditNumber = () => {
    this.setState(getInitialState(this.props))
  }

  /**
   * Send phone verification request with the entered values.
   */
  _handleRequestCode: PhoneChangeSubmitHandler = async (values) => {
    const {
      initialPhoneNumber,
      initialPhoneNumberVerified,
      intl,
      requestPhoneVerificationSms
    } = this.props
    const phoneNumber = 'phoneNumber' in values ? values.phoneNumber : null

    // Send the SMS request if one of these conditions apply:
    // - the user entered a (valid) phone number different than their current verified number,
    // - the user clicks 'Request new code' for an already pending number
    //   (they could have refreshed the page in between).
    let submittedNumber
    if (
      phoneNumber &&
      !(phoneNumber === initialPhoneNumber && initialPhoneNumberVerified)
    ) {
      submittedNumber = phoneNumber
    } else if (this._isPhoneNumberPending()) {
      submittedNumber = initialPhoneNumber
    }

    if (submittedNumber) {
      this.setState({ submittedNumber })
      await requestPhoneVerificationSms(submittedNumber, intl)
    }
    this._handleCancelEditNumber()
  }

  /**
   * Send phone validation code.
   */
  _handleSubmitCode: PhoneVerificationSubmitHandler = async (values) => {
    const { intl, verifyPhoneNumber } = this.props
    const submittedCode =
      'validationCode' in values ? values.validationCode : null

    if (submittedCode) {
      this.setState({ submittedCode })
      await verifyPhoneNumber(submittedCode, intl)
      // If user enters the wrong code, re-enable verification submit.
      // (If user enters the correct code, the page will be refreshed.)
      this.setState({ submittedCode: '' })
    }
  }

  _isPhoneNumberPending = () => {
    const { initialPhoneNumber, initialPhoneNumberVerified } = this.props
    return !isBlank(initialPhoneNumber) && !initialPhoneNumberVerified
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { initialPhoneNumber, initialPhoneNumberVerified } = this.props
    const numberChanged = initialPhoneNumber !== prevProps.initialPhoneNumber
    const verifiedChanged =
      initialPhoneNumberVerified !== prevProps.initialPhoneNumberVerified

    // If new phone number and verified status are received,
    // then reset/clear the inputs.
    if (numberChanged || verifiedChanged) {
      this._handleCancelEditNumber()
    }

    // If a new phone number was submitted,
    // i.e. initialPhoneNumber changed AND initialPhoneNumberVerified turns false,
    // set an ARIA alert that the phone number was successfully submitted.
    if (numberChanged && !initialPhoneNumberVerified) {
      this.setState({ phoneNumberReceived: true })
    }

    // If a verification code was submitted successfully,
    // i.e. initialPhoneNumber did not change AND initialPhoneVerified turns from false to true,
    // set an ARIA alert that the phone number was successfully verified.
    if (!numberChanged && verifiedChanged && initialPhoneNumberVerified) {
      this.setState({ phoneNumberVerified: true })
    }

    // If the user cancels the phone number change form,
    // return the keyboard focus to the "Change number" button that started all.
    if (
      prevState.isEditing &&
      !this.state.isEditing &&
      this.state.submittedNumber === ''
    ) {
      this._changeRef.current?.focus()
    }
  }

  render() {
    const { descriptorId, initialPhoneNumber, phoneFormatOptions } = this.props
    const {
      isEditing,
      phoneNumberReceived,
      phoneNumberVerified,
      submittedCode,
      submittedNumber
    } = this.state
    const hasSubmittedNumber = !isBlank(submittedNumber)
    const hasSubmittedCode = !isBlank(submittedCode)
    const isPending = hasSubmittedNumber || this._isPhoneNumberPending()
    const isAlertBusy = (isEditing && hasSubmittedNumber) || hasSubmittedCode

    const shownPhoneNumberRaw = hasSubmittedNumber
      ? submittedNumber
      : initialPhoneNumber
    const shownPhoneNumber = formatPhoneNumber(shownPhoneNumberRaw)
    const ariaPhoneNumber = getAriaPhoneNumber(
      formatPhoneNumber(initialPhoneNumber)
    )

    // Note: ARIA alerts are read out only once, until they change,
    // so there is no need to clear them.
    // TODO: Find a correct way to render phone numbers for screen readers (at least for US).
    let ariaAlertContent
    if (phoneNumberReceived) {
      ariaAlertContent = (
        <>
          <FormattedMessage
            id="components.PhoneNumberEditor.phoneNumberSubmitted"
            values={{
              phoneNumber: ariaPhoneNumber
            }}
          />{' '}
          {/* Repeat in the alert that the user has to lookup and enter a validation code next. */}
          <FormattedMessage id="components.PhoneNumberEditor.verificationInstructions" />
        </>
      )
    } else if (phoneNumberVerified) {
      ariaAlertContent = (
        <FormattedMessage
          id="components.PhoneNumberEditor.phoneNumberVerified"
          values={{
            phoneNumber: ariaPhoneNumber
          }}
        />
      )
    }

    return (
      <>
        {isEditing ? (
          <PhoneChangeForm
            isSubmitting={hasSubmittedNumber}
            onCancel={this._handleCancelEditNumber}
            onSubmit={this._handleRequestCode}
            phoneFormatOptions={phoneFormatOptions}
            showCancel={!!initialPhoneNumber}
          />
        ) : (
          <FormGroup>
            <ControlStrip>
              {/* Use an anchor so that the aria-label applies and phone actions can be performed,
                  if necessary. Styling will make the text appear plain (mostly). */}
              <PlainLink
                aria-label={ariaPhoneNumber}
                href={`tel:${shownPhoneNumberRaw}`}
                id={descriptorId}
              >
                {shownPhoneNumber}
              </PlainLink>
              {/* Invisible parentheses for no-CSS and screen readers */}
              <InvisibleA11yLabel> (</InvisibleA11yLabel>
              {isPending ? (
                <BsLabel bsStyle="warning">
                  <FormattedMessage id="components.PhoneNumberEditor.pending" />
                </BsLabel>
              ) : (
                phoneNumberVerified && (
                  <BsLabel style={{ background: 'green' }}>
                    <FormattedMessage id="components.PhoneNumberEditor.verified" />
                  </BsLabel>
                )
              )}
              <InvisibleA11yLabel>)</InvisibleA11yLabel>
              <button
                // "Downgrading" to a plain button so we can insert a ref to return keyboard focus on cancel.
                className="btn btn-default"
                onClick={this._handleEditNumber}
                ref={this._changeRef}
                style={{ padding: '2px 12px' }}
              >
                <FormattedMessage id="components.PhoneNumberEditor.changeNumber" />
              </button>
            </ControlStrip>
          </FormGroup>
        )}
        <InvisibleA11yLabel aria-busy={isAlertBusy} as="div" role="alert">
          {ariaAlertContent}
        </InvisibleA11yLabel>

        {isPending && !isEditing && (
          <PhoneVerificationForm
            onRequestCode={this._handleRequestCode}
            onSubmit={this._handleSubmitCode}
          />
        )}
      </>
    )
  }
}

const mapStateToProps = (state: AppReduxState) => {
  const { phoneFormatOptions } = state.otp.config
  return {
    phoneFormatOptions
  }
}

const mapDispatchToProps = {
  requestPhoneVerificationSms: userActions.requestPhoneVerificationSms,
  verifyPhoneNumber: userActions.verifyPhoneNumber
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PhoneNumberEditor))
