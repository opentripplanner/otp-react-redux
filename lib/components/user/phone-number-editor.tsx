import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  Label
} from 'react-bootstrap'
import { Field, FormikErrors } from 'formik'
import {
  formatPhoneNumber,
  isPossiblePhoneNumber
  // @ts-expect-error Package does not have type declaration
} from 'react-phone-number-input'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
// @ts-expect-error Package does not have type declaration
import Input from 'react-phone-number-input/input'
import React, { Component, Fragment } from 'react'
import styled, { css } from 'styled-components'

import { getErrorStates, isBlank } from '../../util/ui'
import SpanWithSpace from '../util/span-with-space'

interface Fields {
  validationCode: string
}

interface Props {
  errors: FormikErrors<Fields>
  initialPhoneNumber: string
  initialPhoneNumberVerified: boolean
  intl: IntlShape
  isPhoneNumberVerified: boolean
  onRequestCode: (code: string) => void
  onSubmitCode: (code: string) => void
  phoneFormatOptions: {
    countryCode: string
  }
  phoneNumber: string
  resetForm: () => void
  touched: Fields
  values: Fields
}

interface State {
  isEditing: boolean
  newPhoneNumber: string
}

// Styles
const ControlStrip = styled.div`
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
const InlineStatic = styled(FormControl.Static)`
  ${phoneFieldCss}
`
const InlinePhoneInput = styled(Input)`
  ${phoneFieldCss}
`

const FlushLink = styled(Button)`
  padding-left: 0;
  padding-right: 0;
`

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

      // Holds the new phone number (+15555550123 format) entered by the user
      // (outside of Formik because (Phone)Input does not have a standard onChange event or simple valitity test).
      newPhoneNumber: ''
    }
  }

  _handleEditNumber = () => {
    this.setState({
      isEditing: true,
      newPhoneNumber: ''
    })
  }

  _handleNewPhoneNumberChange = (newPhoneNumber: string) => {
    this.setState({
      newPhoneNumber
    })
  }

  _handleCancelEditNumber = () => {
    this.setState({
      isEditing: false
    })
  }

  _handlePhoneNumberKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 13) {
      // On the user pressing enter (keyCode 13) on the phone number field,
      // prevent form submission and request the code.
      e.preventDefault()
      this._handleRequestCode()
    }
  }

  _handleValidationCodeKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 13) {
      // On the user pressing enter (keyCode 13) on the validation code field,
      // prevent form submission and send the validation code.
      e.preventDefault()
      this._handleSubmitCode()
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
      onRequestCode(submittedNumber)
    }
  }

  _handleSubmitCode = () => {
    const { errors, onSubmitCode, values } = this.props
    const { validationCode } = values

    if (!errors.validationCode) {
      onSubmitCode(validationCode)
    }
  }

  _isPhoneNumberPending = () => {
    const { initialPhoneNumber, initialPhoneNumberVerified } = this.props
    return !isBlank(initialPhoneNumber) && !initialPhoneNumberVerified
  }

  componentDidUpdate(prevProps: Props) {
    // If new phone number and verified status are received,
    // then reset/clear the inputs.
    if (
      this.props.phoneNumber !== prevProps.phoneNumber ||
      this.props.isPhoneNumberVerified !== prevProps.isPhoneNumberVerified
    ) {
      this._handleCancelEditNumber()
      this.props.resetForm()
    }
  }

  render() {
    const {
      errors, // Formik prop
      initialPhoneNumber,
      intl,
      phoneFormatOptions,
      touched // Formik prop
    } = this.props
    const { isEditing, newPhoneNumber } = this.state
    const isPending = this._isPhoneNumberPending()

    // Here are the states we are dealing with:
    // - First time entering a phone number/validation code (blank value, not modified)
    //   => no color, no feedback indication.
    // - Typing backspace all the way to erase a number/code (blank value, modified)
    //   => red error.
    // - Typing a phone number that doesn't match the configured phoneNumberRegEx
    //   => red error.
    const isPhoneInvalid = !isPossiblePhoneNumber(newPhoneNumber)
    const showPhoneError = isPhoneInvalid && !isBlank(newPhoneNumber)
    const phoneErrorState = showPhoneError ? 'error' : null
    // @ts-expect-error TODO Add TypeScript to getErrorStates module.
    const codeErrorState = getErrorStates(this.props).validationCode

    return (
      <>
        {isEditing ? (
          // FIXME: If removing the Save/Cancel buttons on the account screen,
          // make this <FormGroup> a <form> and remove onKeyDown handler.
          <FormGroup validationState={phoneErrorState}>
            <ControlLabel>
              <FormattedMessage id="components.PhoneNumberEditor.prompt" />
            </ControlLabel>
            <ControlStrip>
              <InlinePhoneInput
                className="form-control"
                country={phoneFormatOptions.countryCode}
                onChange={this._handleNewPhoneNumberChange}
                onKeyDown={this._handlePhoneNumberKeyDown}
                placeholder={intl.formatMessage({
                  id: 'components.PhoneNumberEditor.placeholder'
                })}
                type="tel"
                value={newPhoneNumber}
              />
              <Button
                bsStyle="primary"
                disabled={isPhoneInvalid}
                onClick={this._handleRequestCode}
              >
                <FormattedMessage id="components.PhoneNumberEditor.sendVerificationText" />
              </Button>
              {
                // Show cancel button only if a phone number is already recorded.
                initialPhoneNumber && (
                  <Button onClick={this._handleCancelEditNumber}>
                    <FormattedMessage id="common.forms.cancel" />
                  </Button>
                )
              }
              {showPhoneError && (
                <HelpBlock>
                  <FormattedMessage id="components.PhoneNumberEditor.invalidPhone" />
                </HelpBlock>
              )}
            </ControlStrip>
          </FormGroup>
        ) : (
          <FormGroup>
            <ControlLabel>
              <FormattedMessage id="components.PhoneNumberEditor.smsDetail" />
            </ControlLabel>
            <ControlStrip>
              <InlineStatic>
                <SpanWithSpace margin={0.5}>
                  {formatPhoneNumber(initialPhoneNumber)}
                </SpanWithSpace>
                {isPending ? (
                  // eslint-disable-next-line jsx-a11y/label-has-for
                  <Label bsStyle="warning">
                    <FormattedMessage id="components.PhoneNumberEditor.pending" />
                  </Label>
                ) : (
                  // eslint-disable-next-line jsx-a11y/label-has-for
                  <Label bsStyle="success">
                    <FormattedMessage id="components.PhoneNumberEditor.verified" />
                  </Label>
                )}
              </InlineStatic>
              <Button onClick={this._handleEditNumber}>
                <FormattedMessage id="components.PhoneNumberEditor.changeNumber" />
              </Button>
            </ControlStrip>
          </FormGroup>
        )}

        {isPending && !isEditing && (
          // FIXME: If removing the Save/Cancel buttons on the account screen,
          // make this <FormGroup> a <form> and remove onKeyDown handler.
          <FormGroup validationState={codeErrorState}>
            <p>
              <FormattedMessage id="components.PhoneNumberEditor.verificationInstructions" />
            </p>
            <ControlLabel>
              <FormattedMessage id="components.PhoneNumberEditor.verificationCode" />
            </ControlLabel>
            <ControlStrip>
              <Field
                as={InlineTextInput}
                maxLength={6}
                name="validationCode"
                onKeyDown={this._handleValidationCodeKeyDown}
                placeholder="123456"
                // HACK: <input type='tel'> triggers the numerical keypad on mobile devices, and otherwise
                // behaves like <input type='text'> with support of leading zeros and the maxLength prop.
                // <input type='number'> causes values to be stored as Number, resulting in
                // leading zeros to be invalid and stripped upon submission.
                type="tel"

                // onBlur, onChange, and value are passed automatically by Formik
              />
              <Button
                bsStyle="primary"
                disabled={!!errors.validationCode}
                onClick={this._handleSubmitCode}
              >
                <FormattedMessage id="components.PhoneNumberEditor.verify" />
              </Button>
              {touched.validationCode && errors.validationCode && (
                <HelpBlock>
                  <FormattedMessage id="components.PhoneNumberEditor.invalidCode" />
                </HelpBlock>
              )}
            </ControlStrip>
            <FlushLink bsStyle="link" onClick={this._handleRequestCode}>
              <FormattedMessage id="components.PhoneNumberEditor.requestNewCode" />
            </FlushLink>
          </FormGroup>
        )}
      </>
    )
  }
}

export default injectIntl(PhoneNumberEditor)
