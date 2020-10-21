import { Field, Formik } from 'formik'
import React, { Component } from 'react'
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  Label,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import { formatPhoneNumber, isPossiblePhoneNumber } from 'react-phone-number-input'
import Input from 'react-phone-number-input/input'
import styled, { css } from 'styled-components'
import * as yup from 'yup'

import { isBlank } from '../../util/ui'

const allowedNotificationChannels = [
  {
    type: 'email',
    text: 'Email'
  },
  {
    type: 'sms',
    text: 'SMS'
  },
  {
    type: 'none',
    text: 'Don\'t notify me'
  }
]

// Styles
// HACK: Preverve container height.
const Details = styled.div`
  min-height: 150px;
  margin-bottom: 15px;
`
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

const INVALID_PHONE_MSG = 'Please enter a valid phone number.'

/**
 * @param {*} props The props from which to extract the Formik state to test.
 * @param {*} field THe field name to test.
 * @returns One of the Bootstrao validationState values.
 */
function getErrorState (props, field) {
  const { errors, touched, values } = props
  const value = values[field]
  const isInvalid = isBlank(value) || !!errors[field]

  // one of the Bootstrap validationState values.
  return isInvalid && touched[field]
    ? 'error'
    : null
}

const codeValidationSchema = yup.object({
  validationCode: yup.string().required('Please enter a validation code.')
})

/**
 * User notification preferences pane.
 */
class NotificationPrefsPane extends Component {
  _handleOnPhoneVerified = ({ isPhoneNumberVerified, phoneNumber }) => {
    const { setFieldValue } = this.props

    // Update the parent's Formik state (so when saving, it sends the updated numbers)
    setFieldValue('isPhoneNumberVerified', isPhoneNumberVerified)
    setFieldValue('phoneNumber', phoneNumber)
  }

  render () {
    // All props below are Formik props (https://formik.org/docs/api/formik#props-1)
    // except * below which indicates the prop is provided by UserAccountScreen.
    const {
      handleBlur,
      handleChange,
      onRequestPhoneVerificationCode, // *
      onSendPhoneVerificationCode, // *
      phoneFormatOptions, // *
      values: userData
    } = this.props

    const {
      email,
      isPhoneNumberVerified,
      notificationChannel,
      phoneNumber
    } = userData

    const initialFormikValues = {
      validationCode: ''
    }

    return (
      <div>
        <p>
          You can receive notifications about trips you frequently take.
        </p>
        <FormGroup>
          <ControlLabel>How would you like to receive notifications?</ControlLabel>
          <ButtonToolbar>
            <ToggleButtonGroup
              name='notificationChannel'
              type='radio'
              defaultValue={notificationChannel}
            >
              {allowedNotificationChannels.map(({ type, text }, index) => (
                // FIXME: If removing the Save/Cancel buttons on the account screen,
                // persist changes immediately when onChange is triggered.
                <ToggleButton
                  bsStyle={notificationChannel === type ? 'primary' : 'default'}
                  key={index}
                  // onBlur and onChange have to be set on individual controls instead of the control group
                  // in order for Formik to correcly process the changes.
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={type}
                >
                  {text}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </ButtonToolbar>
        </FormGroup>
        <Details>
          {notificationChannel === 'email' && (
            <FormGroup>
              <ControlLabel>Notification emails will be sent to:</ControlLabel>
              <FormControl.Static>{email}</FormControl.Static>
            </FormGroup>
          )}
          {notificationChannel === 'sms' && (
            <Formik
              // Phone number needs to be validated on change.
              validateOnChange
              validationSchema={codeValidationSchema}
              initialValues={initialFormikValues}
            >
              {
                // Pass Formik props to the component rendered so Formik can manage its validation.
                // (The validation for this component is independent of the validation set in UserAccountScreen.)
                innerProps => {
                  return (
                    <PhoneNumberEditor
                      {...innerProps}
                      initialPhoneNumber={phoneNumber}
                      initialPhoneNumberVerified={isPhoneNumberVerified}
                      onRequestCode={onRequestPhoneVerificationCode}
                      onSubmitCode={onSendPhoneVerificationCode}
                      onVerified={this._handleOnPhoneVerified}
                      phoneFormatOptions={phoneFormatOptions}
                    />
                  )
                }
              }
            </Formik>
          )}
        </Details>
      </div>
    )
  }
}

export default NotificationPrefsPane

/**
 * Sub-component that handles phone number and validation code editing and validation intricacies.
 */
class PhoneNumberEditor extends Component {
  constructor (props) {
    super(props)

    const { initialPhoneNumber, initialPhoneNumberVerified } = props
    this.state = {
      // Holds the last known verified phone number.
      currentNumber: initialPhoneNumber,

      // The verified status of the above number.
      currentNumberVerified: initialPhoneNumberVerified,

      // If true, phone number is being edited.
      // For new users, render component in editing state.
      isEditing: isBlank(initialPhoneNumber),

      // If true, a phone verification request has been sent and the UI is awaiting the user sending the code.
      isPending: false,

      // Holds the new phone number (+15555550123 format) entered by the user
      // (outside of Formik because (Phone)Input does not have a standard onChange event or simple valitity test).
      newPhoneNumber: ''
    }
  }

  _handleEditNumber = () => {
    this.setState({
      isEditing: true,
      isPending: false,
      newPhoneNumber: ''
    })
  }

  _handleNewPhoneNumberChange = newPhoneNumber => {
    this.setState({
      newPhoneNumber
    })
  }

  _handleCancelEditNumber = () => {
    this.setState({
      isEditing: false,
      isPending: false
    })
  }

  _handlePhoneNumberKeyDown = e => {
    if (e.keyCode === 13) {
      // On the user pressing enter (keyCode 13) on the phone number field,
      // prevent form submission and request the code.
      e.preventDefault()
      this._handleRequestCode()
    }
  }

  _handleValidationCodeKeyDown = e => {
    if (e.keyCode === 13) {
      // On the user pressing enter (keyCode 13) on the validation code field,
      // prevent form submission and send the validation code.
      e.preventDefault()
      this._handleSubmitCode()
    }
  }

  _handleRequestCode = async () => {
    // Send phone verification request with the entered values.
    const { onRequestCode, setFieldValue, setFieldTouched } = this.props
    const { currentNumber, currentNumberVerified, newPhoneNumber } = this.state

    // If user enters the same phone number as their current verified number,
    // just cancel editing without sending a verification SMS.
    if (newPhoneNumber === currentNumber && currentNumberVerified) {
      this._handleCancelEditNumber()
    } else {
      // Empty the input box (and disable the Send text button).
      this.setState({
        newPhoneNumber: ''
      })

      const { isPhoneNumberVerified, phoneNumber } = await onRequestCode(newPhoneNumber)

      if (phoneNumber === newPhoneNumber && !isPhoneNumberVerified) {
        // On success (phoneNumber is updated and verified status is false), update the phone number in component state.
        this.setState({
          newPhoneNumber: phoneNumber
        })

        // Set empty code field in Formik's state and prompt for code.
        setFieldValue('validationCode', '')
        setFieldTouched('validationCode', false)
        this.setState({
          isEditing: false,
          isPending: true
        })
      } else if (currentNumber) {
        // On failure, exit the editing state if there is a current number.
        // (Stay in edit mode if there is no current number.)
        this._handleCancelEditNumber()
      }
    }
  }

  _handleSubmitCode = async () => {
    const { onSubmitCode, onVerified, setFieldValue, values } = this.props
    const { validationCode } = values

    // Clear the code field and disable the verify button.
    // (The code to send is already captured in const above.)
    setFieldValue('validationCode', '')

    const result = await onSubmitCode(validationCode)

    if (result && result.isPhoneNumberVerified) {
      // On success (status is changed to verified), update the phone number in component state and hide the code field.
      this.setState({
        currentNumber: result.phoneNumber,
        currentNumberVerified: true,
        isPending: false,
        newPhoneNumber: ''
      })

      onVerified(result)
    }
  }

  render () {
    // All props below are Formik props (https://formik.org/docs/api/formik#props-1)
    // except where indicated.
    const {
      errors,
      phoneFormatOptions, // Provided by parent.
      touched
    } = this.props
    const { currentNumber, currentNumberVerified, isEditing, isPending, newPhoneNumber } = this.state

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
    const codeErrorState = getErrorState(this.props, 'validationCode')

    return (
      <>
        {isEditing
          ? (
            // FIXME: If removing the Save/Cancel buttons on the account screen,
            // make this <FormGroup> a <form> and remove onKeyDown handler.
            <FormGroup validationState={phoneErrorState}>
              <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
              <ControlStrip>
                <InlinePhoneInput
                  className='form-control'
                  country={phoneFormatOptions.countryCode}
                  onChange={this._handleNewPhoneNumberChange}
                  onKeyDown={this._handlePhoneNumberKeyDown}
                  placeholder='Enter phone number'
                  readOnly={!isEditing}
                  type='tel'
                  value={newPhoneNumber}
                />
                <Button
                  bsStyle='primary'
                  disabled={isPhoneInvalid}
                  onClick={this._handleRequestCode}
                >
                  Send verification text
                </Button>
                { // Show cancel button only if a phone number is already recorded.
                  currentNumber && <Button onClick={this._handleCancelEditNumber}>Cancel</Button>}
                {showPhoneError && <HelpBlock>{INVALID_PHONE_MSG}</HelpBlock>}
              </ControlStrip>
            </FormGroup>
          ) : (
            <FormGroup>
              <ControlLabel>SMS notifications will be sent to:</ControlLabel>
              <ControlStrip>
                <InlineStatic>
                  {isPending
                    // eslint-disable-next-line jsx-a11y/label-has-for
                    ? <>{formatPhoneNumber(newPhoneNumber)} <Label bsStyle='warning'>Pending</Label></>
                    // eslint-disable-next-line jsx-a11y/label-has-for
                    : <>{formatPhoneNumber(currentNumber)} {currentNumberVerified && <Label bsStyle='success'>Verified</Label>}</>
                  }
                </InlineStatic>
                <Button onClick={this._handleEditNumber}>Change number</Button>
              </ControlStrip>
            </FormGroup>
          )}

        {isPending && (
          // FIXME: If removing the Save/Cancel buttons on the account screen,
          // make this <FormGroup> a <form> and remove onKeyDown handler.
          <FormGroup validationState={codeErrorState}>
            <p>
              Please check the SMS messaging app on your mobile phone
              for a text message with a verification code, and enter the code below.
            </p>
            <ControlLabel>Verification code:</ControlLabel>
            <ControlStrip>
              <Field as={InlineTextInput}
                name='validationCode'
                onKeyDown={this._handleValidationCodeKeyDown}
                placeholder='123456'
                // onBlur, onChange, and value are passed automatically by Formik
              />
              <Button
                bsStyle='primary'
                disabled={!!errors.validationCode}
                onClick={this._handleSubmitCode}
              >
                Verify
              </Button>
              {touched.validationCode && errors.validationCode && (
                <HelpBlock>{errors.validationCode}</HelpBlock>
              )}
            </ControlStrip>
            <FlushLink bsStyle='link' onClick={this._handleRequestCode}>Request a new code</FlushLink>
          </FormGroup>
        )}
      </>
    )
  }
}
