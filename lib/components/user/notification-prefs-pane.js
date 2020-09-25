import PropTypes from 'prop-types'
import React from 'react'
import {
  ButtonToolbar,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
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
  height: 150px;
`

/**
 * User notification preferences pane.
 */
const NotificationPrefsPane = ({
  errors,
  handleBlur,
  handleChange,
  touched,
  values: userData
}) => {
  const {
    email,
    notificationChannel,
    phoneNumber
  } = userData

  let phoneValidationState = null
  if (touched.phoneNumber && phoneNumber.length > 0) {
    phoneValidationState = errors.phoneNumber ? 'error' : 'success'
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
            <FormControl disabled type='text' value={email} />
          </FormGroup>
        )}
        {notificationChannel === 'sms' && (
          // FIXME: Merge the validation feedback upon approving PR #224.
          <FormGroup validationState={phoneValidationState}>
            <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
            <FormControl
              name='phoneNumber'
              onBlur={handleBlur}
              onChange={handleChange}
              type='tel'
              value={phoneNumber}
            />
            <FormControl.Feedback />
            {errors.phoneNumber && <HelpBlock>{errors.phoneNumber}</HelpBlock>}
          </FormGroup>
        )}
      </Details>
    </div>
  )
}

NotificationPrefsPane.propTypes = {
  handleBlur: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired
}

export default NotificationPrefsPane
