// @ts-expect-error Package yup does not have type declarations.
import * as yup from 'yup'
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { Formik, FormikProps } from 'formik'
import React, { Fragment } from 'react'
import styled from 'styled-components'

import PhoneNumberEditor from './phone-number-editor'

interface Fields {
  notificationChannel: string
}

interface Props extends FormikProps<Fields> {
  loggedInUser: {
    email: string
    isPhoneNumberVerified?: boolean
    phoneNumber?: string
  }
  onRequestPhoneVerificationCode: (code: string) => void
  onSendPhoneVerificationCode: (code: string) => void
  phoneFormatOptions: {
    countryCode: string
  }
}

const allowedNotificationChannels = ['email', 'sms', 'none']

// Styles
// HACK: Preserve container height.
const Details = styled.div`
  min-height: 60px;
  margin-bottom: 15px;
`

const ButtonGroup = styled.fieldset.attrs({
  className: 'btn-group'
})`
  display: block;

  /* Format <legend> like labels. */
  legend {
    border: none;
    font-size: inherit;
    font-weight: 700;
    margin-bottom: 5px;
  }

  label::first-letter {
    text-transform: uppercase;
  }

  input {
    clip: rect(0, 0, 0, 0);
    height: 0;
    /* Firefox will still render (tiny) controls, even if their bounds are empty,
       so move them out of sight. */
    left: -20px;
    position: relative;
    width: 0;
  }

  input:focus + label {
    outline: 5px auto blue;
    /* This next line enhances the visuals in Chromium (webkit) browsers */
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
}: Props): JSX.Element => {
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
        <ButtonGroup>
          <legend>
            <FormattedMessage id="components.NotificationPrefsPane.notificationChannelPrompt" />
          </legend>
          {allowedNotificationChannels.map((type, index) => {
            // TODO: If removing the Save/Cancel buttons on the account screen,
            // persist changes immediately when onChange is triggered.
            const inputId = `notification-channel-${type}`
            const isChecked = notificationChannel === type
            return (
              <Fragment key={type}>
                {/* Note: labels are placed after inputs so that the CSS focus selector can be easily applied. */}
                <input
                  checked={isChecked}
                  id={inputId}
                  name="notificationChannel"
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
                  // An inline style needs to be used for the first element.
                  // The bootstrap CSS will other override .btn:first-child content.
                  style={
                    index === 0
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
          // @ts-expect-error onSubmit is not passed to Formik because PhoneNumberEditor handles code submission on its own.
          <Formik
            initialValues={initialFormikValues}
            validateOnChange
            validationSchema={codeValidationSchema}
          >
            {
              // Pass Formik props to the component rendered so Formik can manage its validation.
              // (The validation for this component is independent of the validation set in UserAccountScreen.)
              (innerProps) => (
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
          </Formik>
        )}
      </Details>
    </div>
  )
}

export default NotificationPrefsPane
