// @ts-expect-error Package yup does not have type declarations.
import * as yup from 'yup'
import {
  Label as BsLabel,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock
} from 'react-bootstrap'
import { Field, Form, Formik, FormikProps } from 'formik'
import {
  formatPhoneNumber,
  isPossiblePhoneNumber
  // @ts-expect-error Package does not have type declaration
} from 'react-phone-number-input'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
// @ts-expect-error Package does not have type declaration
import Input from 'react-phone-number-input/input'
import React, { Component, Fragment, useCallback } from 'react'
import styled, { css } from 'styled-components'

import { getErrorStates, isBlank } from '../../util/ui'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import SpanWithSpace from '../util/span-with-space'

import { labelStyle } from './styled'
import PhoneChangeForm from './phone-change-form'
import PhoneVerificationForm from './phone-verification-form'

interface Fields {
  validationCode: string
}

interface Props extends FormikProps<Fields> {
  initialPhoneNumber?: string
  initialPhoneNumberVerified?: boolean
  intl: IntlShape
  onRequestCode: (code: string) => void
  onSendPhoneVerificationCode: (code: string) => void
  phoneFormatOptions: {
    countryCode: string
  }
  resetForm: () => void
}

interface State {
  isEditing: boolean
  isSubmitted: boolean
  newPhoneNumber: string
}

// Styles
const ControlStrip = styled.span`
  display: block;
  > * {
    margin-right: 4px;
  }
`
const phoneFieldCss = css`
  display: inline-block;
  vertical-align: middle;
  width: 14em;
`
const InlineTextInput = styled(FormControl)`
  ${phoneFieldCss}
`
const InlineStatic = styled.span`
  ${phoneFieldCss}
`
const InlinePhoneInput = styled(Input)`
  ${phoneFieldCss}
`
const FakeLabel = styled.span`
  display: block;
  ${labelStyle}
`

const FlushLink = styled(Button)`
  padding-left: 0;
  padding-right: 0;
`

// The validation schema fo phone numbers - relies on the react-phone-number-input library.
const phoneValidationSchema = yup.object({
  phoneNumber: yup
    .string()
    .required()
    .test(
      'phone-number-format',
      'invalidPhoneNumber', // not directly shown.
      (value) => value && isPossiblePhoneNumber(value)
    )
})

/**
 * Sub-component that handles phone number and validation code editing and validation intricacies.
 */
class PhoneNumberEditor extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { initialPhoneNumber } = props
    this.state = {
      // If true, phone number is being edited.
      // For new users, render component in editing state.
      isEditing: isBlank(initialPhoneNumber),

      // Whether the new number was submitted for verification.
      isSubmitted: false,

      // Holds the new phone number (+15555550123 format) entered by the user.
      // (This is done outside of Formik because (Phone)Input does not have a
      // standard onChange event or a simple validity test).
      newPhoneNumber: ''
    }
  }

  _handleEditNumber = () => {
    this.setState({
      isEditing: true,
      newPhoneNumber: ''
    })
  }

  _handleNewPhoneNumberChange = (newPhoneNumber = '') => {
    this.setState({
      newPhoneNumber
    })
  }

  _handleCancelEditNumber = () => {
    this.setState({
      isEditing: false,
      isSubmitted: false
    })
  }

  _handlePhoneNumberKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Cancel editing when user presses ESC from the phone number field.
      this._handleCancelEditNumber()
    }
  }

  /**
   * Send phone verification request with the entered values.
   */
  _handleRequestCode = () => {
    const { initialPhoneNumber, initialPhoneNumberVerified, onRequestCode } =
      this.props
    const { newPhoneNumber } = this.state

    this._handleCancelEditNumber()

    // Send the SMS request if one of these conditions apply:
    // - the user entered a valid phone number different than their current verified number,
    // - the user clicks 'Request new code' for an already pending number
    //   (they could have refreshed the page in between).
    let submittedNumber

    if (
      newPhoneNumber &&
      isPossiblePhoneNumber(newPhoneNumber) &&
      !(newPhoneNumber === initialPhoneNumber && initialPhoneNumberVerified)
    ) {
      submittedNumber = newPhoneNumber
    } else if (this._isPhoneNumberPending()) {
      submittedNumber = initialPhoneNumber
    }

    if (submittedNumber) {
      // TODO: disable submit while submitting.
      this.setState({ isSubmitted: true })
      alert('Change request sent')
      // onRequestCode(submittedNumber)
    }

    // Disable automatic form submission (especially if there are errors).
    e.preventDefault()
  }

  _isPhoneNumberPending = () => {
    const { initialPhoneNumber, initialPhoneNumberVerified } = this.props
    return !isBlank(initialPhoneNumber) && !initialPhoneNumberVerified
  }

  componentDidUpdate(prevProps: Props) {
    // If new phone number and verified status are received,
    // then reset/clear the inputs.
    if (
      this.props.initialPhoneNumber !== prevProps.initialPhoneNumber ||
      this.props.initialPhoneNumberVerified !==
        prevProps.initialPhoneNumberVerified
    ) {
      this._handleCancelEditNumber()
      this.props.resetForm()
    }
  }

  render() {
    const {
      initialPhoneNumber,
      intl,
      onSendPhoneVerificationCode,
      phoneFormatOptions
    } = this.props
    const { isEditing, isSubmitted, newPhoneNumber } = this.state
    const isPending = isSubmitted || this._isPhoneNumberPending()

    return (
      <>
        {isEditing ? (
          <PhoneChangeForm
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
                <SpanWithSpace margin={0.5}>
                  {formatPhoneNumber(
                    isSubmitted ? newPhoneNumber : initialPhoneNumber
                  )}
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
            onRequestCode={this._handleRequestCode}
            onSubmit={onSendPhoneVerificationCode}
          />
        )}
      </>
    )
  }
}

export default injectIntl(PhoneNumberEditor)
