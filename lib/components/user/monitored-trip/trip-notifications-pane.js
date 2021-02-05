import { Field } from 'formik'
import React, { Component } from 'react'
import { Alert, FormControl, Glyphicon } from 'react-bootstrap'
import styled from 'styled-components'

import Icon from '../../narrative/icon'

const notificationChannelLabels = {
  email: 'email',
  sms: 'SMS'
}

// Element styles
const SettingsList = styled.ul`
  border-spacing: 0 10px;
  display: table;
  padding-left: 0;
  width: 100%;
  label {
    font-weight: inherit;
  }
  & > li {
    align-items: center;
    display: block;
  }
`

// Using table display for this element, so that all dropdowns occupy the same width.
// (Bootstrap already sets them to occupy 100% of the width of the parent, i.e. the logical cell.)
const SettingsListWithAlign = styled(SettingsList)`
  & > li {
    display: table-row;
    & > * {
      display: table-cell;
      margin-left: 10px;
    }
  }
`

const InlineFormControl = styled(FormControl)`
  display: inline-block;
  margin: 0 0.5em;
  width: auto;
`

const SettingsToggle = styled.button`
  background: none;
  border: none;
  padding: 0;
  & span.fa {
    line-height: 150%;
  }
`

/**
 * A label followed by a dropdown control.
 */
const Select = ({ children, Control = FormControl, label, name }) => (
  // <Field> is kept outside of <label> to accommodate layout in table/grid cells.
  <>
    <label htmlFor={name}>{label}</label>
    <Field
      as={Control}
      componentClass='select'
      id={name}
      name={name}
    >
      {children}
    </Field>
  </>
)

/**
 * This component wraps the elements to edit trip notification settings.
 */
class TripNotificationsPane extends Component {
  state = {
    showAdvancedSettings: false
  }

  _handleToggleAdvancedSettings = () => {
    this.setState({ showAdvancedSettings: !this.state.showAdvancedSettings })
  }

  render () {
    const { notificationChannel } = this.props
    const { showAdvancedSettings } = this.state
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

          <h4>
            <SettingsToggle
              aria-expanded={showAdvancedSettings}
              aria-label='Toggle advanced settings'
              onClick={this._handleToggleAdvancedSettings}
              type='button'
            >
              <Icon type={showAdvancedSettings ? 'caret-down' : 'caret-right'} />
              Advanced settings
            </SettingsToggle>
          </h4>
          {showAdvancedSettings && (
            <SettingsList>
              <li>
                <Select
                  Control={InlineFormControl}
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
          )}
        </>
      )
    }

    return (
      <div>
        {notificationSettingsContent}
      </div>
    )
  }
}

export default TripNotificationsPane
