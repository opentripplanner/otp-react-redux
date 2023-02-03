/* eslint-disable react/prop-types */
import * as yup from 'yup'
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { Formik } from 'formik'
import React, { Fragment } from 'react'
import styled from 'styled-components'

import PhoneNumberEditor from './phone-number-editor'

const allowedNotificationChannels = ['email', 'sms', 'none']

// Styles
// HACK: Preserve container height.
const Details = styled.div`
  min-height: 60px;
  margin-bottom: 15px;
`

const ButtonGroup = styled.div.attrs({
  className: 'btn-group'
})`
  display: block;

  label::first-letter {
    text-transform: uppercase;
  }

  input {
    clip: rect(0, 0, 0, 0);
    height: 0;
    width: 0;
  }

  input:focus + label {
    outline: 5px auto blue;
    outline: 5px auto -webkit-focus-ring-color;
    outline-offset: -2px;
  }
`
// Because we show the same message for the two validation conditions below,
// there is no need to pass that message here,
// that is done in the corresponding `<HelpBlock>` in PhoneNumberEditor.
const codeValidationSchema = yup.object({
  validationCode: yup
    .string()
    .required()
    .matches(/^\d{6}$/) // 6-digit string
})

/**
 * User notification preferences pane.
 */
const NotificationPrefsPane = ({
  handleBlur, // Formik prop
  handleChange, // Formik prop
  loggedInUser,
  onRequestPhoneVerificationCode,
  onSendPhoneVerificationCode,
  phoneFormatOptions,
  values: userData // Formik prop
}) => {
  const { email, isPhoneNumberVerified, phoneNumber } = loggedInUser

  const { notificationChannel } = userData

  const initialFormikValues = {
    validationCode: ''
  }

  return (
    <div>
      <p>
        <FormattedMessage id="components.NotificationPrefsPane.description" />
      </p>
      <FormGroup>
        <ControlLabel>
          <FormattedMessage id="components.NotificationPrefsPane.notificationChannelPrompt" />
        </ControlLabel>
        <ButtonGroup>
          {allowedNotificationChannels.map((type) => {
            // TODO: If removing the Save/Cancel buttons on the account screen,
            // persist changes immediately when onChange is triggered.
            const inputId = `notification-channel-${type}`
            const isChecked = notificationChannel === type
            return (
              <Fragment key={type}>
                <input
                  checked={isChecked}
                  id={inputId}
                  name="notificationChannel"
                  // onBlur and onChange have to be set on individual controls instead of the control group
                  // in order for Formik to correctly process the changes.
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="radio"
                  value={type}
                />
                <label
                  className={`btn ${
                    isChecked ? 'btn-primary active' : 'btn-default'
                  }`}
                  htmlFor={inputId}
                  style={
                    type === 'email'
                      ? {
                          borderBottomLeftRadius: '4px',
                          borderTopLeftRadius: '4px'
                        }
                      : {}
                  }
                >
                  {type === 'email' ? (
                    <FormattedMessage id="common.notifications.email" />
                  ) : type === 'sms' ? (
                    <FormattedMessage id="common.notifications.sms" />
                  ) : (
                    <FormattedMessage id="components.NotificationPrefsPane.noneSelect" />
                  )}
                </label>
              </Fragment>
            )
          })}
        </ButtonGroup>
      </FormGroup>
      <Details>
        {notificationChannel === 'email' && (
          <FormGroup>
            <ControlLabel>
              <FormattedMessage id="components.NotificationPrefsPane.notificationEmailDetail" />
            </ControlLabel>
            <FormControl.Static>{email}</FormControl.Static>
          </FormGroup>
        )}
        {notificationChannel === 'sms' && (
          <Formik
            initialValues={initialFormikValues}
            validateOnChange
            validationSchema={codeValidationSchema}
          >
            {
              // Pass Formik props to the component rendered so Formik can manage its validation.
              // (The validation for this component is independent of the validation set in UserAccountScreen.)
              (innerProps) => {
                return (
                  <PhoneNumberEditor
                    {...innerProps}
                    initialPhoneNumber={phoneNumber}
                    initialPhoneNumberVerified={isPhoneNumberVerified}
                    onRequestCode={onRequestPhoneVerificationCode}
                    onSubmitCode={onSendPhoneVerificationCode}
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

export default NotificationPrefsPane
