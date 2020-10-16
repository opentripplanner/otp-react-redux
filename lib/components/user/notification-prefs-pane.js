import PhoneNumber from 'awesome-phonenumber'
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
import styled, { css } from 'styled-components'
import * as yup from 'yup'

import { formatPhoneNumber, isBlank } from '../../util/ui'

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

/**
 * User notification preferences pane.
 */
class NotificationPrefsPane extends Component {
  constructor (props) {
    super(props)

    this.phoneValidationSchema = yup.object({
      newPhoneNumber: yup.string()
        .required(INVALID_PHONE_MSG)
        .matches(new RegExp(props.phoneFormatOptions.validationRegExp), INVALID_PHONE_MSG),
      validationCode: yup.string().required('Please enter a validation code.')
    })
  }

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
      isPhoneNumberVerified,
      notificationChannel,
      phoneNumber
    } = userData

    const initialFormikValues = {
      newPhoneNumber: '',
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
              <Field as={FormControl} name='email' readOnly />
            </FormGroup>
          )}
          {notificationChannel === 'sms' && (
            <Formik
              // Phone number needs to be validated on change.
              validateOnChange
              validationSchema={this.phoneValidationSchema}
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
      currentNumber: formatPhoneNumber(initialPhoneNumber, props.phoneFormatOptions),

      // The verified status of the above number.
      currentNumberVerified: initialPhoneNumberVerified,

      // If true, phone number is being edited.
      // For new users, render component in editing state.
      isEditing: isBlank(initialPhoneNumber),

      // If true, a phone verification request has been sent and the UI is awaiting the user sending the code.
      isPending: false
    }
  }

  _handleEditNumber = () => {
    this.setState({
      isEditing: true,
      isPending: false
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
    const { onRequestCode, phoneFormatOptions, setFieldValue, setFieldTouched, values } = this.props
    const { newPhoneNumber } = values

    // Empty the input box (and disable the Send text button).
    setFieldValue('newPhoneNumber', '')
    setFieldTouched('newPhoneNumber', false)

    const submittedNumber = new PhoneNumber(newPhoneNumber, phoneFormatOptions.regionCode).getNumber('e164')
    const result = await onRequestCode(submittedNumber)

    if (result && result.phoneNumber === submittedNumber && !result.isPhoneNumberVerified) {
      // On success (phoneNumber is updated and verified status is false), update the formatted phone number in Formik's state.
      setFieldValue('newPhoneNumber', formatPhoneNumber(result.phoneNumber, phoneFormatOptions))

      // Set empty code field in Formik's state and prompt for code.
      setFieldValue('validationCode', '')
      setFieldTouched('validationCode', false)
      this.setState({
        isEditing: false,
        isPending: true
      })
    }
  }

  _handleSubmitCode = async () => {
    const { onSubmitCode, onVerified, phoneFormatOptions, setFieldValue, values } = this.props
    const { validationCode } = values

    // Clear the code field and disable the verify button.
    // (The code to send is already captured in const above.)
    setFieldValue('validationCode', '')

    const result = await onSubmitCode(validationCode)

    if (result && result.isPhoneNumberVerified) {
      // On success (status is changed to verified), update the phone number in Formik's state and hide the code field.
      setFieldValue('newPhoneNumber', '')

      this.setState({
        currentNumber: formatPhoneNumber(result.phoneNumber, phoneFormatOptions),
        currentNumberVerified: true,
        isPending: false
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
      touched,
      values
    } = this.props
    const { newPhoneNumber } = values
    const { currentNumber, currentNumberVerified, isEditing, isPending } = this.state

    // Here are the states we are dealing with:
    // - First time entering a phone number/validation code (blank value, not modified)
    //   => no color, no feedback indication.
    // - Typing backspace all the way to erase a number/code (blank value, modified)
    //   => red error.
    // - Typing a phone number that doesn't match the configured phoneNumberRegEx
    //   => red error.
    const phoneErrorState = getErrorState(this.props, 'newPhoneNumber')
    const codeErrorState = getErrorState(this.props, 'validationCode')

    return (
      <>
        {isEditing
          ? (
            <FormGroup validationState={phoneErrorState}>
              <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
              <ControlStrip>
                <Field as={InlineTextInput}
                  name='newPhoneNumber'
                  onKeyDown={this._handlePhoneNumberKeyDown}
                  placeholder={phoneFormatOptions.inputPlaceholder}
                  type='tel'
                // onBlur, onChange, and value are passed automatically by Formik
                />
                <Button
                  bsStyle='primary'
                  disabled={isBlank(newPhoneNumber) || !!errors.newPhoneNumber}
                  onClick={this._handleRequestCode}
                >
                  Send verification text
                </Button>
                { // Show cancel button only if a phone number is already recorded.
                  currentNumber && <Button onClick={this._handleCancelEditNumber}>Cancel</Button>}
                {touched.newPhoneNumber && <HelpBlock>{errors.newPhoneNumber}</HelpBlock>}
              </ControlStrip>
            </FormGroup>
          ) : (
            <FormGroup>
              <ControlLabel>SMS notifications will be sent to:</ControlLabel>
              <ControlStrip>
                <InlineStatic>
                  {isPending
                    // eslint-disable-next-line jsx-a11y/label-has-for
                    ? <>{newPhoneNumber} <Label bsStyle='warning'>Pending</Label></>
                    // eslint-disable-next-line jsx-a11y/label-has-for
                    : <>{currentNumber} {currentNumberVerified && <Label bsStyle='success'>Verified</Label>}</>
                  }
                </InlineStatic>
                <Button onClick={this._handleEditNumber}>Change number</Button>
              </ControlStrip>
            </FormGroup>
          )}

        {isPending && (
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
