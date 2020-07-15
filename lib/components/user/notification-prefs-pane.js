import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ButtonToolbar, ControlLabel, FormControl, FormGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
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
  height: 150px;
`

/**
 * User notification preferences pane.
 */
class NotificationPrefsPane extends Component {
  static propTypes = {
    onUserDataChange: PropTypes.func.isRequired,
    userData: PropTypes.object.isRequired
  }

  _handleNotificationChannelChange = e => {
    const { onUserDataChange } = this.props
    onUserDataChange({ notificationChannel: e })
  }

  _handlePhoneNumberChange = e => {
    const { onUserDataChange } = this.props
    onUserDataChange({ phoneNumber: e.target.value })
  }

  render () {
    const { userData } = this.props
    const {
      email,
      notificationChannel,
      phoneNumber
    } = userData

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
            <FormGroup>
              <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
              {/* TODO: Add field validation. */}
              <FormControl onChange={this._handlePhoneNumberChange} type='tel' value={phoneNumber} />
            </FormGroup>
          )}
        </Details>
      </div>
    )
  }
}

export default NotificationPrefsPane
