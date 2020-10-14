import { Field } from 'formik'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import styled, { css } from 'styled-components'

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

/**
 * @param {*} props The props from which to extract the Formik state to test.
 * @param {*} field THe field name to test.
 * @returns One of the Bootstrao validationState values.
 */
function getValidationState (props, field) {
  const { errors, touched, values } = props
  const value = values[field]
  const isBlank = !(value && value.length)
  const isInvalid = isBlank || !!errors[field]

  // one of the Bootstrap validationState values.
  return isInvalid && touched[field]
    ? 'error'
    : null
}

/**
 * User notification preferences pane.
 */
class NotificationPrefsPane extends Component {
  static propTypes = {
    onRequestPhoneVerificationCode: PropTypes.func.isRequired,
    onSendPhoneVerificationCode: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      // Whether the phone number is being edited.
      // Intially false if an existing user has a phone number already.
      // For (new) users who don't have a number entered, we want to set that to true.
      isEditingPhoneNumber: !props.values.phoneNumber,

      // If true, a phone verification request has been sent and the UI is awaiting the user sending the code.
      isVerificationPending: false
    }
  }

  _handleEditNumber = () => {
    // Initialize Formik state's pending phone number to blank.
    this.props.setFieldValue('pendingPhoneNumberFormatted', '')

    this.setState({
      isEditingPhoneNumber: true,
      isVerificationPending: false
    })
  }

  _handleCancelEditNumber = () => {
    this.setState({
      isEditingPhoneNumber: false
    })
  }

  _handlePhoneNumberKeyDown = e => {
    if (e.keyCode === 13) {
      // On the user pressing enter (keyCode 13) on the phone number field,
      // prevent form submission and request the code.
      e.preventDefault()
      this._handleRequestPhoneVerificationCode()
    }
  }

  _handleValidationCodeKeyDown = e => {
    if (e.keyCode === 13) {
      // On the user pressing enter (keyCode 13) on the phone number field,
      // prevent form submission and request the code.
      e.preventDefault()
      this._handleSendPhoneVerificationCode()
    }
  }

  _handleRequestPhoneVerificationCode = async () => {
    // Send phone verification request with the entered values.
    const { setFieldValue, setFieldTouched, values: userData } = this.props
    const { pendingPhoneNumberFormatted } = userData

    // Exit editing first (hides the Send Text button).
    this._handleCancelEditNumber()

    const result = await this.props.onRequestPhoneVerificationCode(pendingPhoneNumberFormatted, setFieldValue)

    if (result) {
      // On success, update the phone number in Formik's state.
      setFieldValue('pendingPhoneNumber', result.pendingPhoneNumber)
      setFieldValue('pendingPhoneNumberFormatted', result.pendingPhoneNumberFormatted)

      // Set empty code field in Formik's state and prompt for code.
      setFieldValue('phoneValidationCode', '')
      setFieldTouched('phoneValidationCode', false)
      this.setState({
        isVerificationPending: true
      })
    } else {
      // Else discard the pending phone numbers.
      setFieldValue('pendingPhoneNumber', '')
      setFieldValue('pendingPhoneNumberFormatted', '')
    }
  }

  _handleSendPhoneVerificationCode = async () => {
    const { setFieldValue, values: userData } = this.props
    const { phoneValidationCode } = userData

    // Clear the code field and disable the verify button.
    // (The code to send is already captured in const above.)
    setFieldValue('phoneValidationCode', '')

    const result = await this.props.onSendPhoneVerificationCode(phoneValidationCode)

    if (result) {
      // On success, update the phone number in Formik's state and hide the code field.
      setFieldValue('phoneNumber', result.phoneNumber)
      setFieldValue('phoneNumberFormatted', result.phoneNumberFormatted)
      setFieldValue('pendingPhoneNumber', '')
      setFieldValue('pendingPhoneNumberFormatted', '')

      this.setState({
        isVerificationPending: false
      })
    }
  }

  render () {
    // All props below are Formik props (https://formik.org/docs/api/formik#props-1)
    // except where indicated.
    const {
      errors,
      handleBlur,
      handleChange,
      phoneNumberPlaceholder, // provided by UserAccountScreen
      touched,
      values: userDataWithValidationCode
    } = this.props

    const {
      isEditingPhoneNumber,
      isVerificationPending
    } = this.state
    const {
      notificationChannel,
      phoneNumberFormatted,
      pendingPhoneNumberFormatted
    } = userDataWithValidationCode

    // Here are the states we are dealing with:
    // - First time entering a phone number/validation code (blank value, not modified)
    //   => no color, no feedback indication.
    // - Typing backspace all the way to erase a number/code (blank value, modified)
    //   => red error.
    // - Typing a phone number that doesn't match the configured phoneNumberRegEx
    //   => red error.

    const phoneFieldValidationState = getValidationState(this.props, 'pendingPhoneNumberFormatted')
    const codeFieldValidationState = getValidationState(this.props, 'phoneValidationCode')

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
            <div>
              {isEditingPhoneNumber
                ? (
                  <FormGroup validationState={phoneFieldValidationState}>
                    <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
                    <ControlStrip>
                      <Field as={InlineTextInput}
                        name='pendingPhoneNumberFormatted'
                        onKeyDown={this._handlePhoneNumberKeyDown}
                        placeholder={phoneNumberPlaceholder}
                        type='tel'
                      // onBlur, onChange, and value are passed automatically by Formik
                      />
                      <Button
                        bsStyle='primary'
                        disabled={!!errors.pendingPhoneNumberFormatted}
                        onClick={this._handleRequestPhoneVerificationCode}
                      >
                        Send verification text
                      </Button>
                      <Button onClick={this._handleCancelEditNumber}>Cancel</Button>
                      {touched.pendingPhoneNumberFormatted && <HelpBlock>{errors.pendingPhoneNumberFormatted}</HelpBlock>}
                    </ControlStrip>
                  </FormGroup>
                ) : (
                  <FormGroup>
                    <ControlLabel>SMS notifications will be sent to:</ControlLabel>
                    <ControlStrip>
                      <InlineStatic>
                        {isVerificationPending ? `${pendingPhoneNumberFormatted} (pending)` : phoneNumberFormatted}
                      </InlineStatic>
                      <Button onClick={this._handleEditNumber}>Change number</Button>
                    </ControlStrip>
                  </FormGroup>
                )}

              {isVerificationPending && (
                <FormGroup validationState={codeFieldValidationState}>
                  <p>
                    Please check the SMS messaging app on your mobile phone
                    for a text message with a verification code, and enter the code below.
                  </p>
                  <ControlLabel>Verification code:</ControlLabel>
                  <ControlStrip>
                    <Field as={InlineTextInput}
                      name='phoneValidationCode'
                      onKeyDown={this._handleValidationCodeKeyDown}
                      placeholder='123456'
                      // onBlur, onChange, and value are passed automatically by Formik
                    />
                    <Button
                      bsStyle='primary'
                      disabled={!!errors.phoneValidationCode}
                      onClick={this._handleSendPhoneVerificationCode}
                    >
                      Verify
                    </Button>
                    {touched.phoneValidationCode && errors.phoneValidationCode && (
                      <HelpBlock>{errors.phoneValidationCode}</HelpBlock>
                    )}
                  </ControlStrip>
                  <FlushLink bsStyle='link' onClick={this._handleRequestPhoneVerificationCode}>Request a new code</FlushLink>
                </FormGroup>
              )}
            </div>
          )}
        </Details>
      </div>
    )
  }
}

export default NotificationPrefsPane
