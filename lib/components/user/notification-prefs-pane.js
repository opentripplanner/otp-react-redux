import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  HelpBlock,
  Modal,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import styled from 'styled-components'

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
const ButtonStrip = styled.div`
  > * {
    margin-right: 4px;
  }
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
      // If true, a phone verification request has been sent and the UI is awaiting the user sending the code.
      isVerificationPending: false,
      // Holds the validation code.
      phoneValidationCode: ''
    }
  }

  _handlePhoneValidationCodeChange = e => {
    // Update validation code state.
    this.setState({
      phoneValidationCode: e.target.value
    })
  }

  _handlePhoneValidationCancel = () => {
    // Exit the phone verification process.
    this.setState({
      isVerificationPending: false,
      phoneValidationCode: ''
    })
  }

  _handleRequestPhoneVerificationCode = () => {
    // Send phone verification request.
    this.props.onRequestPhoneVerificationCode()

    // Prompt for code.
    this.setState({
      isVerificationPending: true,
      phoneValidationCode: ''
    })
  }

  _handleSendPhoneVerificationCode = async () => {
    await this.props.onSendPhoneVerificationCode(this.state.phoneValidationCode)

    // Exit verification modal (erase the verification code).
    if (this.props.userData.isPhoneNumberVerified) {
      this.setState({
        isVerificationPending: false,
        phoneValidationCode: ''
      })
    } else {
      this.setState({
        phoneValidationCode: ''
      })
    }
  }

  render () {
    // All props below are Formik props (https://formik.org/docs/api/formik#props-1)
    const {
      errors,
      handleBlur,
      handleChange,
      touched,
      values: userData
    } = this.props

    const {
      isVerificationPending,
      phoneValidationCode
    } = this.state
    const {
      email,
      isPhoneNumberVerified,
      notificationChannel,
      phoneNumber
    } = userData

    // Here are the states we are dealing with:
    // - First time entering a phone number (phoneNumber blank, not modified)
    //   => no color, no feedback indication.
    // - Typing backspace all the way to erase a number (phoneNumber blank, modified)
    //   => red, "[X] Please provide a number" indication.
    // - Viewing a verified phone number (phoneNumber non-blank, same as initial, verified)
    //   => green, "[V] Verified" indication.
    // - Editing a phone number (phoneNumber non-blank, different than initial or not verified)
    //   => yellow, "[!] Verification required" indication.

    const isPhoneNumberBlank = !(phoneNumber && phoneNumber.length)

    let phoneStatusGlyph // one of the Bootstrap glyphs.
    let phoneStatusText
    let phoneFieldValidationState // one of the Bootstrap validationState values.
    let shouldVerifyPhone = false

    if (isPhoneNumberBlank) {
      if (!touched.phoneNumber) {
        // Do not show an indication in initial state.
      } else {
        phoneStatusGlyph = 'remove'
        phoneStatusText = 'Please provide a number'
        phoneFieldValidationState = 'error'
      }
    } else if (!touched.phoneNumber && isPhoneNumberVerified) {
      phoneStatusGlyph = 'ok'
      phoneStatusText = 'Verified'
      phoneFieldValidationState = 'success'
    } else {
      phoneStatusGlyph = 'warning-sign'
      phoneStatusText = 'Verification required'
      phoneFieldValidationState = 'warning'
      shouldVerifyPhone = true
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
                <FormControl
                  name='phoneNumber'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  // Fake US phone number, see https://en.wikipedia.org/wiki/555_(telephone_number)
                  placeholder='+15555550123'
                  type='tel'
                  value={phoneNumber}
                />
                <FormControl.Feedback />
                {errors.phoneNumber && <HelpBlock>{errors.phoneNumber}</HelpBlock>}
                {/* Show glyphs underneath the input control with <HelpBlock>
                    (there are some alignment issues with <FormControl.Feedback /> in mobile view). */}
                <HelpBlock>
                  {phoneStatusGlyph && <Glyphicon glyph={phoneStatusGlyph} />} {phoneStatusText}
                </HelpBlock>

                {shouldVerifyPhone && (
                  <ButtonStrip>
                    <Button bsStyle='primary' onClick={this._handleRequestPhoneVerificationCode}>Verify my phone</Button>
                  </ButtonStrip>
                )}
              </FormGroup>

              {/* The dialog prompt for validation code. */}
              <Modal onHide={this._handlePhoneValidationCancel} show={isVerificationPending}>
                <Modal.Header>
                  <Modal.Title>Enter verification code</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                  <p>
                  Please check the SMS messaging app on your mobile phone
                  for a text message with a verification code, and enter the code below.
                  </p>
                  <FormGroup>
                    <ControlLabel>Verification code:</ControlLabel>
                    <FormControl onChange={this._handlePhoneValidationCodeChange} value={phoneValidationCode} />
                  </FormGroup>
                  <p>
                    <Button bsStyle='link' onClick={this._handleRequestPhoneVerificationCode}>Request a new code</Button>
                  </p>
                </Modal.Body>

                <Modal.Footer>
                  <Button onClick={this._handlePhoneValidationCancel}>Cancel</Button>
                  <Button bsStyle='primary' onClick={this._handleSendPhoneVerificationCode}>Verify my phone</Button>
                </Modal.Footer>
              </Modal>
            </div>
          )}
        </Details>
      </div>
    )
  }
}

export default NotificationPrefsPane
