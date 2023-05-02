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

const allowedNotificationChannels = ['email', 'sms', 'none']

// Styles
// HACK: Preserve container height.
const Details = styled.div`
  min-height: 60px;
  margin-bottom: 15px;
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
