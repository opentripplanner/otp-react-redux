// @ts-expect-error Package yup does not have type declarations.
import * as yup from 'yup'
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap'
import { Field, Formik, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import React, { Fragment } from 'react'
import styled from 'styled-components'

import ButtonGroup from '../util/button-group'

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
          {allowedNotificationChannels.map((type) => {
            // TODO: If removing the Save/Cancel buttons on the account screen,
            // persist changes immediately when onChange is triggered.
            const inputId = `notification-channel-${type}`
            const isChecked = notificationChannel === type
            return (
              <Fragment key={type}>
                {/* Note: labels are placed after inputs so that the CSS focus selector can be easily applied. */}
                <Field
                  id={inputId}
                  name="notificationChannel"
                  type="radio"
                  value={type}
                />
                <label
                  className={
                    isChecked ? 'btn btn-primary active' : 'btn btn-default'
                  }
                  htmlFor={inputId}
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
