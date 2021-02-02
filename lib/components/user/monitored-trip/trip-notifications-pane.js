import { Field } from 'formik'
import React from 'react'
import { Alert, FormControl, Glyphicon } from 'react-bootstrap'
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
  label {
    font-weight: inherit;
  }
  & > li {
    align-items: center;
    display: block;
  }
`

// Using table display so that all Bootstrap selectors occupy the same width.
// (They are already set to occupy 100% of the width of parent, in this case the cell.)
const SettingsListWithAlign = styled(SettingsList)`
  & > li {
    display: table-row;
    & > * {
      display: table-cell;
    }
  }
`

const InlineField = styled(Field)`
  display: inline-block;
  margin: 0 0.5em;
  width: auto;
`

/**
 * A selector control with a label.
 */
const Select = ({ children, FieldComponent = Field, label, name }) => (
  // FieldComponent is kept outside of <label> to accommodate layout in table/grid cells.
  <>
    <label htmlFor={name}>{label}</label>
    <FieldComponent
      as={FormControl}
      componentClass='select'
      id={name}
      name={name}
    >
      {children}
    </FieldComponent>
  </>
)

/**
 * This component wraps the elements to edit trip notification settings.
 */
const TripNotificationsPane = ({ notificationChannel }) => {
  // Set text based on user's notificationChannel.
  const areNotificationsDisabled = notificationChannel === 'none'

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
        <h4>Notify me via {notificationChannelLabels[notificationChannel]} when:</h4>
        <SettingsListWithAlign>
          <li>
            <Select
              label='There is a realtime alert flagged on my journey'
              name='notifyOnAlert'
            >
              <option value>Yes (default)</option>
              <option value={false}>No</option>
            </Select>
          </li>
          <li>
            <Select
              label='An alternative route or transfer point is recommended'
              name='notifyOnItineraryChange'
            >
              <option value>Yes (default)</option>
              <option value={false}>No</option>
            </Select>
          </li>
          <li>
            <Select
              label='There are delays or disruptions of more than'
              name='departureVarianceMinutesThreshold'
            >
              <option value={5}>5 min (default)</option>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
            </Select>
          </li>
        </SettingsListWithAlign>

        <h4>Advanced settings</h4>
        <SettingsList>
          <li>
            <Select
              FieldComponent={InlineField}
              label='Monitor this trip'
              name='leadTimeInMinutes'
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min (default)</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
            </Select>
            before it begins until it ends.
          </li>
        </SettingsList>
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
