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
const noBorderOrShadow = css`
  background: transparent;
  border: none;
  box-shadow: none;
`
const InlineTextInput = styled(FormControl)`
  display: inline-block;
  vertical-align: middle;
  width: 12em;
`
const BorderlessInlineTextInput = styled(InlineTextInput)`
  ${noBorderOrShadow}
  &:focus {
    ${noBorderOrShadow}
  }
  &[readonly] {
    ${noBorderOrShadow}
  }
`
const FlushLink = styled(Button)`
  padding-left: 0;
  padding-right: 0;
`

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
      isEditingPhoneNumber: false,

      // If true, a phone verification request has been sent and the UI is awaiting the user sending the code.
      isVerificationPending: false
    }
  }

  _handleEditNumber = () => {
    const { setFieldValue } = this.props

    // Initialize Formik state's pending phone number to blank.
    setFieldValue('pendingPhoneNumberFormatted', '')

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

  _handleRequestPhoneVerificationCode = () => {
    // Send phone verification request with the entered values.
    const { setFieldValue, values: userData } = this.props
    const { pendingPhoneNumberFormatted } = userData
    this.props.onRequestPhoneVerificationCode(pendingPhoneNumberFormatted)

    // Set empty code field in Formik's state
    setFieldValue('phoneValidationCode', '')

    // Prompt for code.
    this.setState({
      isEditingPhoneNumber: false,
      isVerificationPending: true
    })
  }

  _handleSendPhoneVerificationCode = async () => {
    const { values: userData } = this.props

    await this.props.onSendPhoneVerificationCode(userData.phoneValidationCode)

    // When the pending phone number is erased by the backend,
    // this means the phone number has been verified.
    if (!this.props.values.pendingPhoneNumber) {
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
      values: userDataWithValidationFields
    } = this.props

    const {
      isEditingPhoneNumber,
      isVerificationPending
    } = this.state
    const {
      email,
      notificationChannel,
      phoneNumber,
      phoneNumberFormatted,
      pendingPhoneNumberFormatted,
      phoneValidationCode
    } = userDataWithValidationFields

    // Here are the states we are dealing with:
    // - First time entering a phone number (phoneNumber blank, not modified)
    //   => no color, no feedback indication.
    // - Typing backspace all the way to erase a number (phoneNumber blank, modified)
    //   => red error.
    // - Typing a phone number that doesn't match the configured phoneNumberRegEx
    //   => red error.

    const isPhoneNumberBlank = !(phoneNumber && phoneNumber.length)

    let phoneFieldValidationState // one of the Bootstrap validationState values.

    if (isPhoneNumberBlank) {
      if (!touched.pendingPhoneNumberFormatted) {
        // Do not show an indication in initial state.
      } else {
        phoneFieldValidationState = 'error'
      }
    } else if (touched.pendingPhoneNumberFormatted && errors.pendingPhoneNumberFormatted) {
      phoneFieldValidationState = 'error'
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
              <ControlLabel>Notification emails will be sent out to:</ControlLabel>
              <FormControl readOnly type='text' value={email} />
            </FormGroup>
          )}
          {notificationChannel === 'sms' && (
            <div>
              {/* TODO: Add field validation. */}
              {/* FIXME: Merge the validation feedback upon approving PR #224. */}
              <FormGroup validationState={phoneFieldValidationState}>
                <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
                <ControlStrip>
                  {/* Borderless input control for original phone number */}
                  {!isEditingPhoneNumber && (
                    <>
                      <BorderlessInlineTextInput
                        readOnly
                        type='tel'
                        defaultValue={isVerificationPending ? pendingPhoneNumberFormatted : phoneNumberFormatted}
                      />
                      {isVerificationPending && '(pending) '}
                      <Button onClick={this._handleEditNumber}>Change number</Button>
                    </>
                  )}

                  {/* Regular-styled input control for editing the pending phone number */}
                  {isEditingPhoneNumber && (
                    <>
                      <InlineTextInput
                        name='pendingPhoneNumberFormatted'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder={phoneNumberPlaceholder}
                        type='tel'
                        value={pendingPhoneNumberFormatted}
                      />
                      <Button
                        bsStyle='primary'
                        disabled={pendingPhoneNumberFormatted.length === 0 || !!errors.pendingPhoneNumberFormatted}
                        onClick={this._handleRequestPhoneVerificationCode}
                      >
                          Send verification text
                      </Button>
                      <Button onClick={this._handleCancelEditNumber}>Cancel</Button>
                      {errors.pendingPhoneNumberFormatted && <HelpBlock>{errors.pendingPhoneNumberFormatted}</HelpBlock>}
                    </>
                  )}
                </ControlStrip>
              </FormGroup>

              {isVerificationPending && (
                <FormGroup>
                  <p>
                    Please check the SMS messaging app on your mobile phone
                    for a text message with a verification code, and enter the code below.
                  </p>
                  <ControlLabel>Verification code:</ControlLabel>
                  <ControlStrip>
                    <InlineTextInput
                      name='phoneValidationCode'
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder='123456'
                      value={phoneValidationCode}
                    />
                    <Button
                      bsStyle='primary'
                      disabled={!phoneValidationCode || phoneValidationCode.length === 0}
                      onClick={this._handleSendPhoneVerificationCode}
                    >
                      Verify
                    </Button>
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
