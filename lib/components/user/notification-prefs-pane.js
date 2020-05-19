import PropTypes from 'prop-types'
import React from 'react'
import { ButtonToolbar, ControlLabel, FormControl, FormGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'

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

/**
 * User notification preferences pane.
 */
const NotificationPrefsPane = ({
  email,
  notificationChannel,
  onNotificationChannelChange,
  onPhoneNumberChange,
  phoneNumber
}) => (
  <div>
    <p>
      You can receive notifications about trips you frequently take.
    </p>
    <FormGroup>
      <ControlLabel>How would you like to receive notifications?</ControlLabel>
      <ButtonToolbar>
        <ToggleButtonGroup
          name='notificationChannels'
          onChange={onNotificationChannelChange}
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
    <div
      style={{height: '150px'}} // preserve height of pane.
    >
      {notificationChannel === 'email' && (
        <FormGroup>
          <ControlLabel>Notification emails will be sent out to:</ControlLabel>
          <FormControl disabled type='text' value={email} />
        </FormGroup>
      )}
      {notificationChannel === 'sms' && (
        <FormGroup>
          <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
          <FormControl onChange={onPhoneNumberChange} type='tel' value={phoneNumber} />
        </FormGroup>
      )}
    </div>
  </div>
)

NotificationPrefsPane.propTypes = {
  /** Email to display if the email option is selected. */
  email: PropTypes.string.isRequired,
  /** The selected notification channel. */
  notificationChannel: PropTypes.oneOf(
    allowedNotificationChannels.map(({ type }) => type)
  ).isRequired,
  /** Triggered when the notification option is changed. */
  onNotificationChannelChange: PropTypes.func.isRequired,
  /** Triggered when the phone number is changed. */
  onPhoneNumberChange: PropTypes.func.isRequired,
  /** The phone number to display if the SMS option is selected. */
  phoneNumber: PropTypes.string
}

NotificationPrefsPane.defaultProps = {
  phoneNumber: null
}

export default NotificationPrefsPane
