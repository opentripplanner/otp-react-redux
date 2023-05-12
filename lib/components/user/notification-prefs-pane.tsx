import { Field, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import React, { Fragment } from 'react'
import styled from 'styled-components'

import { labelStyle } from './styled'
import { PhoneVerificationSubmitHandler } from './phone-verification-form'
import PhoneNumberEditor, {
  PhoneCodeRequestHandler
} from './phone-number-editor'

interface Fields {
  notificationChannel: string
}

interface Props extends FormikProps<Fields> {
  loggedInUser: {
    email: string
    isPhoneNumberVerified?: boolean
    phoneNumber?: string
  }
  onRequestPhoneVerificationCode: PhoneCodeRequestHandler
  onSendPhoneVerificationCode: PhoneVerificationSubmitHandler
  phoneFormatOptions: {
    countryCode: string
  }
}

const allowedNotificationChannels = ['email', 'sms']

// Styles
const NotificationOption = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 1ch;
  margin-bottom: 10px;

  label {
    display: block;
    font-weight: normal;
    margin-bottom: 0;
  }
  label::first-letter {
    text-transform: uppercase;
  }
`

const NotificationOptions = styled.fieldset`
  /* Format <legend> like labels. */
  legend {
    ${labelStyle}
  }
`

/**
 * User notification preferences pane.
 */
const NotificationPrefsPane = ({
  loggedInUser,
  onRequestPhoneVerificationCode,
  onSendPhoneVerificationCode,
  phoneFormatOptions,
  values: userData // Formik prop // TODO: remove
}: Props): JSX.Element => {
  const { email, isPhoneNumberVerified, phoneNumber } = loggedInUser

  return (
    <div>
      <NotificationOptions>
        <legend>
          <FormattedMessage id="components.NotificationPrefsPane.notificationChannelPrompt" />
        </legend>
        {allowedNotificationChannels.map((type) => {
          // TODO: If removing the Save/Cancel buttons on the account screen,
          // persist changes immediately when onChange is triggered.
          const inputId = `notification-channel-${type}`
          const inputDescriptionId = `${inputId}-description`
          return (
            <NotificationOption key={type}>
              <Field
                aria-describedby={inputDescriptionId}
                id={inputId}
                name="notificationChannel"
                type="checkbox"
                value={type}
              />{' '}
              <span>
                {type === 'email' ? (
                  <>
                    <label htmlFor={inputId}>
                      <FormattedMessage id="common.notifications.email" />
                    </label>
                    <span id={inputDescriptionId} style={{ color: '#757575' }}>
                      {email}
                    </span>
                  </>
                ) : (
                  <>
                    <label htmlFor={inputId}>
                      <FormattedMessage id="common.notifications.sms" />
                    </label>
                    <PhoneNumberEditor
                      descriptorId={inputDescriptionId}
                      initialPhoneNumber={phoneNumber}
                      initialPhoneNumberVerified={isPhoneNumberVerified}
                      onRequestCode={onRequestPhoneVerificationCode}
                      onSubmitCode={onSendPhoneVerificationCode}
                      phoneFormatOptions={phoneFormatOptions}
                    />
                  </>
                )}
              </span>
            </NotificationOption>
          )
        })}
      </NotificationOptions>
    </div>
  )
}

export default NotificationPrefsPane
