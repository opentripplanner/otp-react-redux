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
  // All props below are Formik props (https://formik.org/docs/api/formik#props-1)
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

export default NotificationPrefsPane
