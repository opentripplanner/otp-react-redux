import { Field, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import React from 'react'
import styled from 'styled-components'

import { GREY_ON_WHITE } from '../util/colors'

import { FieldSet } from './styled'
import { User } from './types'
import PhoneNumberEditor from './phone-number-editor'

interface Props extends FormikProps<User> {
  loggedInUser: User
}

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
    color: ${GREY_ON_WHITE};
  }
`

/**
 * User notification preferences pane.
 */
const NotificationPrefsPane = ({
  handleChange, // Formik or custom handler
  values: userData // Formik prop
}: Props): JSX.Element => {
  const { email, isPhoneNumberVerified, phoneNumber } = userData

  return (
    <FieldSet>
      <legend>
        <FormattedMessage id="components.NotificationPrefsPane.notificationChannelPrompt" />
      </legend>
      <ListGroup>
        {emailAndSms.map((type) => {
          const inputId = `notification-channel-${type}`
          const inputDescriptionId = `${inputId}-description`
          return (
            <NotificationOption key={type}>
              <span>
                <Field
                  aria-describedby={inputDescriptionId}
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
                ) : (
                  <PhoneNumberEditor
                    descriptorId={inputDescriptionId}
                    initialPhoneNumber={phoneNumber}
                    initialPhoneNumberVerified={isPhoneNumberVerified}
                  />
                )}
              </span>
            </NotificationOption>
          )
        })}
      </ListGroup>
    </FieldSet>
  )
}

export default NotificationPrefsPane
