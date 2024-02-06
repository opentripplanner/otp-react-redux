import { connect } from 'react-redux'
import { Field, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../util/state-types'
import { GRAY_ON_WHITE } from '../util/colors'

import { FieldSet } from './styled'
import { User } from './types'
import PhoneNumberEditor from './phone-number-editor'

interface Props extends FormikProps<User> {
  allowedNotificationChannels: string[]
  loggedInUser: User
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
  handleChange, // Formik or custom handler
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
          const inputId = `notification-channel-${type}`
          const inputDescriptionId = `${inputId}-description`
          return (
            <NotificationOption key={type}>
              <span>
                <Field
                  aria-describedby={inputDescriptionId}
                  disabled={type === 'push' && !pushDevices}
                  id={inputId}
                  name="notificationChannel"
                  // Override onChange explicitly to use the custom one for existing accounts.
                  // (The Formik's one will still be used for new accounts.)
                  onChange={handleChange}
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
                  />
                ) : (
                  <span id={inputDescriptionId}>
                    {pushDevices ? (
                      <FormattedMessage
                        id="components.NotificationPrefsPane.devicesRegistered"
                        values={{
                          count: pushDevices
                        }}
                      />
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
  const { persistence } = state.otp.config
  const supportsPushNotifications =
    persistence && 'otp_middleware' in persistence
      ? persistence.otp_middleware?.supportsPushNotifications
      : false
  return {
    allowedNotificationChannels: supportsPushNotifications
      ? allNotificationChannels
      : emailAndSms
  }
}

export default connect(mapStateToProps)(NotificationPrefsPane)
