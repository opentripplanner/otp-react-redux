import { Label as BsLabel, Button, FormGroup } from 'react-bootstrap'
// @ts-expect-error Package does not have type declaration
import { formatPhoneNumber } from 'react-phone-number-input'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import React, { Component, Fragment } from 'react'

import { getAriaPhoneNumber } from '../../util/a11y'
import { isBlank } from '../../util/ui'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import SpanWithSpace from '../util/span-with-space'

import { ControlStrip, FakeLabel, InlineStatic } from './styled'
import PhoneChangeForm, { PhoneChangeSubmitHandler } from './phone-change-form'
import PhoneVerificationForm, {
  PhoneVerificationSubmitHandler
} from './phone-verification-form'

export type PhoneCodeRequestHandler = (phoneNumber: string) => void

const blankState = {
  isEditing: false,
  phoneNumberReceived: false,
  phoneNumberVerified: false,
  submittedCode: '',
  submittedNumber: ''
}

interface Props {
  initialPhoneNumber?: string
  initialPhoneNumberVerified?: boolean
  intl: IntlShape
  onRequestCode: PhoneCodeRequestHandler
  onSubmitCode: PhoneVerificationSubmitHandler
  phoneFormatOptions: {
    countryCode: string
  }
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

/**
 * Sub-component that handles phone number and validation code editing and validation intricacies.
 */
class PhoneNumberEditor extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { initialPhoneNumber } = props
    this.state = {
      ...blankState,
      // For new users, render component in editing state.
      isEditing: isBlank(initialPhoneNumber)
    }
  }

  _handleEditNumber = () => this.setState({ isEditing: true })

  _handleCancelEditNumber = () => this.setState(blankState)

  /**
   * Send phone verification request with the entered values.
   */
  _handleRequestCode: PhoneChangeSubmitHandler = async (values) => {
    const { initialPhoneNumber, initialPhoneNumberVerified, onRequestCode } =
      this.props
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
      await onRequestCode(submittedNumber)
      this._handleCancelEditNumber()
    } else {
      this._handleCancelEditNumber()
    }
  }

  /**
   * Send phone validation code.
   */
  _handleSubmitCode: PhoneVerificationSubmitHandler = async (values) => {
    const { onSubmitCode } = this.props
    const submittedCode =
      'validationCode' in values ? values.validationCode : null

    if (submittedCode) {
      this.setState({ submittedCode })
      await onSubmitCode(values)
      // If user enters the wrong code, re-enable verification submit.
      // (If user enters the correct code, the page will be refreshed.)
      this.setState({ submittedCode: '' })
    }
  }

  _isPhoneNumberPending = () => {
    const { initialPhoneNumber, initialPhoneNumberVerified } = this.props
    return !isBlank(initialPhoneNumber) && !initialPhoneNumberVerified
  }

  componentDidUpdate(prevProps: Props) {
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
  }

  render() {
    const { initialPhoneNumber, phoneFormatOptions } = this.props
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
        <FormattedMessage
          id="components.PhoneNumberEditor.phoneNumberSubmitted"
          values={{
            phoneNumber: ariaPhoneNumber
          }}
        />
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
        <InvisibleA11yLabel aria-busy={isAlertBusy} role="alert">
          {ariaAlertContent}
        </InvisibleA11yLabel>
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
            <FakeLabel>
              <FormattedMessage id="components.PhoneNumberEditor.smsDetail" />
            </FakeLabel>
            <ControlStrip>
              <InlineStatic className="form-control-static">
                <SpanWithSpace
                  aria-label={ariaPhoneNumber}
                  as="a"
                  href={`tel:${shownPhoneNumberRaw}`}
                  margin={0.5}
                >
                  {shownPhoneNumber}
                </SpanWithSpace>
                {/* Invisible parentheses for no-CSS and screen readers */}
                <InvisibleA11yLabel> (</InvisibleA11yLabel>
                {isPending ? (
                  <BsLabel bsStyle="warning">
                    <FormattedMessage id="components.PhoneNumberEditor.pending" />
                  </BsLabel>
                ) : (
                  <BsLabel bsStyle="success">
                    <FormattedMessage id="components.PhoneNumberEditor.verified" />
                  </BsLabel>
                )}
                <InvisibleA11yLabel>)</InvisibleA11yLabel>
              </InlineStatic>
              <Button onClick={this._handleEditNumber}>
                <FormattedMessage id="components.PhoneNumberEditor.changeNumber" />
              </Button>
            </ControlStrip>
          </FormGroup>
        )}

        {isPending && !isEditing && (
          <PhoneVerificationForm
            isSubmitting={hasSubmittedCode}
            onRequestCode={this._handleRequestCode}
            onSubmit={this._handleSubmitCode}
          />
        )}
      </>
    )
  }
}

export default injectIntl(PhoneNumberEditor)
