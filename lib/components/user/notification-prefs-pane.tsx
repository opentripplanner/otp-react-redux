import { connect } from 'react-redux'
import { Field, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../util/state-types'
import { GRAY_ON_WHITE } from '../util/colors'
import { PhoneFormatConfig } from '../../util/config-types'

import { FieldSet } from './styled'
import { PhoneVerificationSubmitHandler } from './phone-verification-form'
import { User } from './types'
import PhoneNumberEditor, {
  PhoneCodeRequestHandler
} from './phone-number-editor'

interface Props extends FormikProps<User> {
  allowedNotificationChannels: string[]
  loggedInUser: User
  onRequestPhoneVerificationCode: PhoneCodeRequestHandler
  onSendPhoneVerificationCode: PhoneVerificationSubmitHandler
  phoneFormatOptions: PhoneFormatConfig
}

const allNotificationChannels = ['email', 'sms', 'push']
const emailAndSms = ['email', 'sms']

// Styles
const NotificationOption = styled(ListGroupItem)`
  align-items: flex-start;
  display: flex;

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
  allowedNotificationChannels,
  onRequestPhoneVerificationCode,
  onSendPhoneVerificationCode,
  phoneFormatOptions,
  values: userData // Formik prop
}: Props): JSX.Element => {
  const { email, isPhoneNumberVerified, phoneNumber, pushDevices } = userData

  return (
    <FieldSet>
      <legend>
        <FormattedMessage id="components.NotificationPrefsPane.notificationChannelPrompt" />
      </legend>
      <ListGroup>
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
                  disabled={type === 'push' && !pushDevices}
                  id={inputId}
                  name="notificationChannel"
                  type="checkbox"
                  value={type}
                />
              </span>
              <span>
                <label htmlFor={inputId}>
                  <FormattedMessage id={`common.notifications.${type}`} />
                </label>
                {type === 'email' ? (
                  <span id={inputDescriptionId}>{email}</span>
                ) : type === 'sms' ? (
                  <PhoneNumberEditor
                    descriptorId={inputDescriptionId}
                    initialPhoneNumber={phoneNumber}
                    initialPhoneNumberVerified={isPhoneNumberVerified}
                    onRequestCode={onRequestPhoneVerificationCode}
                    onSubmitCode={onSendPhoneVerificationCode}
                    phoneFormatOptions={phoneFormatOptions}
                  />
                ) : (
                  <span id={inputDescriptionId}>
                    {pushDevices ? (
                      // TODO: i18n
                      `${pushDevices} devices registered`
                    ) : (
                      <FormattedMessage id="components.NotificationPrefsPane.noDeviceForPush" />
                    )}
                  </span>
                )}
              </span>
            </NotificationOption>
          )
        })}
      </ListGroup>
    </FieldSet>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { persistence, phoneFormatOptions } = state.otp.config
  const supportsPushNotifications =
    persistence && 'otp_middleware' in persistence
      ? persistence.otp_middleware?.supportsPushNotifications
      : false
  return {
    allowedNotificationChannels: supportsPushNotifications
      ? allNotificationChannels
      : emailAndSms,
    phoneFormatOptions
  }
}

export default connect(mapStateToProps)(NotificationPrefsPane)
