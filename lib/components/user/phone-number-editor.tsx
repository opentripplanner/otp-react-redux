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
import React, { Component, Fragment } from 'react'
import styled, { css } from 'styled-components'

import { getErrorStates, isBlank } from '../../util/ui'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import SpanWithSpace from '../util/span-with-space'

import { labelStyle } from './styled'

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

// Because we show the same message for the two validation conditions below,
// there is no need to pass that message here,
// that is done in the corresponding `<HelpBlock>` in PhoneNumberEditor.
const codeValidationSchema = yup.object({
  validationCode: yup
    .string()
    .required()
    .matches(/^\d{6}$/) // 6-digit string
})

interface VerificationFromProps extends FormikProps<Fields> {
  onRequestCode: () => void
}

/**
 * Sub-form for entering and submitting a phone validation code.
 */
const PhoneVerificationForm = (props: VerificationFromProps): JSX.Element => {
  // Formik props
  const { errors, onRequestCode, touched } = props
  const codeErrorState = getErrorStates(props).validationCode
  const formId = 'phone-verification-form'

  return (
    <>
      {/* Set up an empty form here without input, and link inputs using the form id.
          (a submit button within will incorrectly submit the entire page instead of the subform.) */}
      <Form id={formId} noValidate />
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
            form={formId}
            maxLength={6}
            name="validationCode"
            placeholder="123456"
            // HACK: <input type='tel'> triggers the numerical keypad on mobile devices, and otherwise
            // behaves like <input type='text'> with support of leading zeros and the maxLength prop.
            // <input type='number'> causes values to be stored as Number, resulting in
            // leading zeros to be invalid and stripped upon submission.
            type="tel"

            // onBlur, onChange, and value are passed automatically by Formik
          />
          <Button bsStyle="primary" form={formId} type="submit">
            <FormattedMessage id="components.PhoneNumberEditor.verify" />
          </Button>
          <HelpBlock role="status">
            {touched.validationCode && errors.validationCode && (
              <FormattedMessage id="components.PhoneNumberEditor.invalidCode" />
            )}
          </HelpBlock>
        </ControlStrip>
        <FlushLink bsStyle="link" onClick={onRequestCode}>
          <FormattedMessage id="components.PhoneNumberEditor.requestNewCode" />
        </FlushLink>
      </FormGroup>
    </>
  )
}

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

    return (
      <>
        {isEditing ? (
          <FormGroup validationState={phoneErrorState}>
            <ControlLabel>
              <FormattedMessage id="components.PhoneNumberEditor.prompt" />
            </ControlLabel>
            <ControlStrip>
              <InlinePhoneInput
                aria-invalid={showPhoneError}
                className="form-control"
                country={phoneFormatOptions.countryCode}
                form="phone-change-form"
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
                form="phone-change-form"
                onClick={this._handleRequestCode}
                type="submit"
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
              <HelpBlock role="status">
                {showPhoneError && (
                  <FormattedMessage id="components.PhoneNumberEditor.invalidPhone" />
                )}
              </HelpBlock>
            </ControlStrip>
          </FormGroup>
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
          <Formik
            initialValues={{ validationCode: '' }}
            onSubmit={onSendPhoneVerificationCode}
            validationSchema={codeValidationSchema}
          >
            {
              // Pass Formik props to the component rendered so Formik can manage its validation.
              // (The validation for this component is independent of the validation set in UserAccountScreen.)
              (formikProps) => (
                <PhoneVerificationForm
                  {...formikProps}
                  onRequestCode={this._handleRequestCode}
                />
              )
            }
          </Formik>
        )}
      </>
    )
  }
}

export default injectIntl(PhoneNumberEditor)
