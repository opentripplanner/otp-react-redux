import { Field, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import React, { Fragment } from 'react'
import styled from 'styled-components'

import { GRAY_ON_WHITE } from '../util/colors'

import { FieldSet } from './styled'
import { PhoneVerificationSubmitHandler } from './phone-verification-form'
import PhoneNumberEditor, {
  PhoneCodeRequestHandler
} from './phone-number-editor'

interface Fields {
  email: string
  isPhoneNumberVerified?: boolean
  notificationChannel: string
  phoneNumber?: string
  pushDeviceName?: string
}

interface Props extends FormikProps<Fields> {
  onRequestPhoneVerificationCode: PhoneCodeRequestHandler
  onSendPhoneVerificationCode: PhoneVerificationSubmitHandler
  phoneFormatOptions: {
    countryCode: string
  }
}

const allowedNotificationChannels = ['email', 'sms', 'push']

// Styles
const NotificationOption = styled.div`
  align-items: flex-start;
  display: flex;
  margin-bottom: 10px;

  /* Match bootstrap's spacing between checkbox and label */
  & > span:first-child {
    flex-shrink: 0;
    width: 20px;
  }

  label {
    display: block;
    font-weight: normal;
    margin-bottom: 0;
  }
  label::first-letter {
    text-transform: uppercase;
  }
  label + span {
    color: ${GRAY_ON_WHITE};
  }
`

/**
 * User notification preferences pane.
 */
const NotificationPrefsPane = ({
  onRequestPhoneVerificationCode,
  onSendPhoneVerificationCode,
  phoneFormatOptions,
  values: userData // Formik prop
}: Props): JSX.Element => {
  const { email, isPhoneNumberVerified, phoneNumber, pushDeviceName } = userData

  return (
    <FieldSet>
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
            <span>
              <Field
                aria-describedby={inputDescriptionId}
                // TODO: Check this condition.
                disabled={type === 'push' && !pushDeviceName}
                id={inputId}
                name="notificationChannel"
                type="checkbox"
                value={type}
              />
            </span>
            <span>
              {type === 'email' ? (
                <>
                  <label htmlFor={inputId}>
                    <FormattedMessage id="common.notifications.email" />
                  </label>
                  <span id={inputDescriptionId}>{email}</span>
                </>
              ) : type === 'sms' ? (
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
              ) : (
                <>
                  <label htmlFor={inputId}>
                    <FormattedMessage id="common.notifications.push" />
                  </label>
                  <span id={inputDescriptionId}>
                    {pushDeviceName || (
                      <FormattedMessage id="components.NotificationPrefsPane.noDeviceForPush" />
                    )}
                  </span>
                </>
              )}
            </span>
          </NotificationOption>
        )
      })}
    </FieldSet>
  )
}

export default NotificationPrefsPane
