import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, ButtonToolbar, ControlLabel, FormControl, FormGroup, Glyphicon, HelpBlock, Modal, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
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

/**
 * User notification preferences pane.
 */
class NotificationPrefsPane extends Component {
  static propTypes = {
    onStartPhoneVerification: PropTypes.func,
    onSendPhoneVerification: PropTypes.func,
    onUserDataChange: PropTypes.func.isRequired,
    userData: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      // Holds the initial phone number or the last confirmed phone number
      initialPhoneNumber: props.userData.phoneNumber,
      // Set to true when the field is changed, to display validation errors subsequently.
      isPhoneFieldModified: false,
      // If true, a phone verification request has been sent and the UI is awaiting the user sending the code.
      isVerificationPending: false,
      // Holds the validation code.
      phoneValidationCode: ''
    }
  }

  _handleNotificationChannelChange = e => {
    const { onUserDataChange } = this.props
    onUserDataChange({ notificationChannel: e })
  }

  _handlePhoneNumberVerified = e => {
    const { onUserDataChange } = this.props
    onUserDataChange({ phoneNumber: e.target.value })
  }

  _handlePhoneNumberChange = e => {
    const { onUserDataChange } = this.props
    onUserDataChange({ phoneNumber: e.target.value })

    // Mark field as modified.
    this.setState({
      isPhoneFieldModified: true
    })
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

  _handleRevertPhoneNumber = () => {
    // Revert entered phone number to the one from the user record.
    // Reset the modified and pending states.
    this.setState({
      isPhoneFieldModified: false,
      isVerificationPending: false
    })

    this.props.onRevertUserPhoneNumber(this.state.userData)
  }

  _handleStartPhoneVerification = () => {
    // Send phone verification request.
    this.props.onStartPhoneVerification()

    // Prompt for code.
    this.setState({
      isVerificationPending: true,
      phoneValidationCode: ''
    })
  }

  _handleSendPhoneVerification = async () => {
    // Send phone verification code.
    await this.props.onSendPhoneVerification(this.state.phoneValidationCode)

    // Exit verification modal and update "initialPhoneNumber" if isPhoneNumberVerified was changed to true.
    // Erase the verification code in all cases for discretion.
    if (this.props.userData.isPhoneNumberVerified) {
      this.setState({
        initialPhoneNumber: this.props.userData.phoneNumber,
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
    const { userData } = this.props
    const { isPhoneFieldModified, isVerificationPending, initialPhoneNumber, phoneValidationCode } = this.state
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
    //   => red, "[X] Verification required" indication.

    const isPhoneNumberBlank = !(phoneNumber && phoneNumber.length)
    const isPhoneNumberSameAsInitial = phoneNumber === initialPhoneNumber

    let phoneStatusGlyph // one of the Bootstrap glyphs.
    let phoneStatusText
    let phoneFieldValidationState // one of the Bootstrap validationState values.
    let shouldVerifyPhone = false

    if (isPhoneNumberBlank) {
      if (!isPhoneFieldModified) {
        // Do not show an indication.
      } else {
        phoneStatusGlyph = 'remove'
        phoneStatusText = 'Please provide a number'
        phoneFieldValidationState = 'error'
      }
    } else if (isPhoneNumberSameAsInitial && isPhoneNumberVerified) {
      phoneStatusGlyph = 'ok'
      phoneStatusText = 'Verified'
      phoneFieldValidationState = 'success'
    } else {
      phoneStatusGlyph = 'remove'
      phoneStatusText = 'Verification required.'
      phoneFieldValidationState = 'error'
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
              name='notificationChannels'
              onChange={this._handleNotificationChannelChange}
              type='radio'
              value={notificationChannel}
            >
              {allowedNotificationChannels.map(({ type, text }, index) => (
                <ToggleButton
                  bsStyle={notificationChannel === type ? 'primary' : 'default'}
                  key={index}
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
              <FormControl disabled type='text' value={email} />
            </FormGroup>
          )}
          {notificationChannel === 'sms' && (
            <div>
              <FormGroup validationState={phoneFieldValidationState}>
                <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
                {/* TODO: Add field validation. */}

                <FormControl
                  onChange={this._handlePhoneNumberChange}
                  placeholder='+12223334567'
                  type='tel'
                  value={phoneNumber}
                />
                {/* Show glyphs underneath the input control
                   (there are some alignment issues with <FormControl.Feedback /> in mobile view),
                   so we use <HelpBlock> instead. */}
                <HelpBlock>
                  {phoneStatusGlyph && <Glyphicon glyph={phoneStatusGlyph} />} {phoneStatusText}
                </HelpBlock>
              </FormGroup>

              {shouldVerifyPhone && (
                <div style={{float: 'right'}}>
                  <Button onClick={this._handleRevertPhoneNumber} style={{marginRight: '4px'}}>Revert number</Button>
                  <Button bsStyle='primary' onClick={this._handleStartPhoneVerification}>Verify my phone</Button>
                </div>
              )}
            </div>
          )}
        </Details>

        {/* The dialog prompt for validation code. */}
        <Modal show={isVerificationPending} onHide={this.handleSendPhoneVerification}>
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
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this._handlePhoneValidationCancel}>Cancel</Button>
            <Button bsStyle='primary' onClick={this._handleSendPhoneVerification}>Verify my phone</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default NotificationPrefsPane
