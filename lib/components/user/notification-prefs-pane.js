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
    onUserDataChange: PropTypes.func.isRequired,
    userData: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      // Set to true when the field is changed, to display validation errors subsequently.
      isPhoneFieldModified: false,
      // If true, a phone verification request has been sent and the UI is awaiting the user sending the code.
      isVerificationPending: false,
      // Holds the entered phone number that needs to be validated.
      pendingPhoneNumber: props.phoneNumber,
      // Holds the validation code.
      phoneValidationCode: null
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
    // Mark field as modified, update pending phone number state.
    this.setState({
      isPhoneFieldModified: true,
      pendingPhoneNumber: e.target.value
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
      isVerificationPending: false
    })
  }

  _handleRevertPhoneNumber = () => {
    // Revert entered phone number to the one from the user record.
    // Reset the modified and pending states.
    this.setState({
      isPhoneFieldModified: false,
      isVerificationPending: false,
      pendingPhoneNumber: this.props.userData.phoneNumber
    })
  }

  _handleStartPhoneVerification = () => {
    // Send the request for phone verification,
    // show controls for entering and sending the validation code.

    // send request

    // Prompt for code
    this.setState({
      isVerificationPending: true,
      phoneValidationCode: null
    })
  }

  _handleSendPhoneVerification = () => {

  }

  render () {
    const { userData } = this.props
    const { isPhoneFieldModified, isVerificationPending, pendingPhoneNumber = '', phoneValidationCode } = this.state
    const {
      email,
      isPhoneNumberVerified,
      notificationChannel,
      phoneNumber
    } = userData

    const shouldVerifyPhone = pendingPhoneNumber && pendingPhoneNumber.length && (!isPhoneNumberVerified || pendingPhoneNumber !== phoneNumber)

    let phoneStatusGlyph // one of the Bootstrap glyphs.
    let phoneStatusText
    let phoneFieldValidationState // one of the Bootstrap validationState values.

    if (isPhoneNumberVerified) {
      phoneStatusGlyph = 'ok'
      phoneStatusText = 'Verified'
      phoneFieldValidationState = 'success'
    } else if (shouldVerifyPhone) {
      phoneStatusGlyph = 'remove'
      phoneStatusText = 'Verification required'
      phoneFieldValidationState = 'error'
    } else if (isPhoneFieldModified) {
      phoneStatusGlyph = 'remove'
      phoneStatusText = 'No number provided'
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
                  ype='tel'
                  value={pendingPhoneNumber}
                />
                {/* Show glyphs underneath the inpiut control
                   (there are some alignment issues with <FormControl.Feedback /> in mobile view). */}
                <HelpBlock>
                  {phoneStatusGlyph && <Glyphicon glyph={phoneStatusGlyph} />} {phoneStatusText}
                </HelpBlock>
              </FormGroup>

              {shouldVerifyPhone && (
                <div style={{float: 'right'}}>
                  <Button onClick={this._handleRevertPhoneNumber}>Revert number</Button>
                  {' '}
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
            <FormGroup>
              <p>
                Please check the SMS messaging app on your mobile phone
                for a text message with a verification code, and enter the code below.
              </p>
              <ControlLabel>Verification code:</ControlLabel>
              <FormControl onChange={this._handlePhoneValidationCodeChange} value={phoneValidationCode} />
            </FormGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this._handlePhoneValidationCancel}>Cancel</Button>
            <Button bsStyle='primary'>Verify my phone</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default NotificationPrefsPane
