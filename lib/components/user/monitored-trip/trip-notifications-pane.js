import { Field } from 'formik'
import React from 'react'
import { Alert, ControlLabel, FormControl, FormGroup, Glyphicon } from 'react-bootstrap'
import styled from 'styled-components'

const notificationChannelLabels = {
  email: 'email',
  sms: 'SMS'
}

const SettingsList = styled.ul`
  border-spacing: 10px;
  display: table;
  padding-left: 20px;
  width: 100%;
  & > li {
    align-items: center;
    display: table-row;
    & > * {
      display: table-cell;
    }
  }
`

const InlineField = styled(Field)`
  display: inline-block;
  width: auto;
`

const TripNotificationsPane = ({ notificationChannel }) => {
  // Set text and visuals based on user's notificationChannel.
  const areNotificationsDisabled = notificationChannel === 'none'
  const notificationChannelText = !areNotificationsDisabled &&
      notificationChannelLabels[notificationChannel]

  let notificationSettingsContent
  if (areNotificationsDisabled) {
    notificationSettingsContent = (
      <Alert bsStyle='warning'>
        <p>
          <Glyphicon glyph='alert' /> <strong>Notifications are turned off for your account.</strong>
        </p>
        <p>
            To receive alerts for your saved trips, enable notifications
            in your account settings, and try saving a trip again.
        </p>
      </Alert>
    )
  } else {
    notificationSettingsContent = (
      <>
        <FormGroup>
          <ControlLabel id='is-active-label'>Notify me via {notificationChannelText} when:</ControlLabel>
          <SettingsList>
            <li>
              <span>There is a realtime alert flagged on my journey:</span>
              <Field
                as={FormControl}
                componentClass='select'
                name='notifyOnAlert'
              >
                <option value>Yes (default)</option>
                <option value={false}>No</option>
              </Field>
            </li>
            <li>
              <span>An alternative route or transfer point is recommended:</span>
              <Field
                as={FormControl}
                componentClass='select'
                name='notifyOnItineraryChange'
              >
                <option value>Yes (default)</option>
                <option value={false}>No</option>
              </Field>
            </li>
            <li>
              <span>There are delays or disruptions of more than:</span>
              <Field
                as={FormControl}
                componentClass='select'
                name='departureVarianceMinutesThreshold'
              >
                <option value={5}>5 min (default)</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
              </Field>
            </li>
          </SettingsList>
        </FormGroup>

        <FormGroup>
          <ControlLabel>
              Advanced settings
          </ControlLabel>
          <SettingsList>
            <li>
              <span>
                  Monitor this trip
                {' '}
                <InlineField
                  as={FormControl}
                  componentClass='select'
                  name='leadTimeInMinutes'
                  style={{ display: 'inline' }}
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min (default)</option>
                  <option value={45}>45 min</option>
                  <option value={60}>1 hour</option>
                </InlineField>
                {' '}
                  before it begins until it ends.
              </span>
            </li>
          </SettingsList>
        </FormGroup>
      </>
    )
  }

  return (
    <div>
      {notificationSettingsContent}
    </div>
  )
}

export default TripNotificationsPane
