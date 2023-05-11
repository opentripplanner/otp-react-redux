import { Field, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import { FormGroup } from 'react-bootstrap'
import React, { Fragment } from 'react'
import styled from 'styled-components'

import ButtonGroup from '../util/button-group'

import { FakeLabel, InlineStatic } from './styled'
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
// HACK: Preserve container height.
const Details = styled.div`
  min-height: 60px;
  margin-bottom: 15px;
`

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

  return (
    <div>
      <fieldset>
        <legend>
          <FormattedMessage id="components.NotificationPrefsPane.notificationChannelPrompt" />
        </legend>
        {allowedNotificationChannels.map((type) => {
          // TODO: If removing the Save/Cancel buttons on the account screen,
          // persist changes immediately when onChange is triggered.
          const inputId = `notification-channel-${type}`
          return (
            <NotificationOption key={type}>
              <Field
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
                    <span style={{ color: '#757575' }}>{email}</span>
                  </>
                ) : (
                  <>
                    <label htmlFor={inputId}>
                      <FormattedMessage id="common.notifications.sms" />
                    </label>
                    <PhoneNumberEditor
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
      </fieldset>
      <Details>
        {notificationChannel === 'email' && (
          <FormGroup>
            <FakeLabel>
              <FormattedMessage id="components.NotificationPrefsPane.notificationEmailDetail" />
            </FakeLabel>
            <InlineStatic>{email}</InlineStatic>
          </FormGroup>
        )}
        {notificationChannel === 'sms' && (
          <PhoneNumberEditor
            initialPhoneNumber={phoneNumber}
            initialPhoneNumberVerified={isPhoneNumberVerified}
            onRequestCode={onRequestPhoneVerificationCode}
            onSubmitCode={onSendPhoneVerificationCode}
            phoneFormatOptions={phoneFormatOptions}
          />
        )}
      </Details>
    </div>
  )
}

export default NotificationPrefsPane
