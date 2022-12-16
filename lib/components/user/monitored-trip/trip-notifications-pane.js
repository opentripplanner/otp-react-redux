/* eslint-disable react/prop-types */
import { Alert, FormControl } from 'react-bootstrap'
import { CaretDown } from '@styled-icons/fa-solid/CaretDown'
import { CaretRight } from '@styled-icons/fa-solid/CaretRight'
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { Field } from 'formik'
import { FormattedMessage, injectIntl, useIntl } from 'react-intl'
import React, { Component } from 'react'
import styled from 'styled-components'

import { IconWithText, StyledIconWrapper } from '../../util/styledIcon'

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
    }
    & > label {
      padding-right: 10px;
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
    {label && <label htmlFor={name}>{label}</label>}
    <Field as={Control} componentClass="select" id={name} name={name}>
      {children}
    </Field>
  </>
)

function Options({ defaultValue, options }) {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  return options.map(({ text, value }, i) => (
    <option key={i} value={value}>
      {value === defaultValue
        ? intl.formatMessage(
            { id: 'common.forms.defaultValue' },
            { value: text }
          )
        : text}
    </option>
  ))
}

const basicYesNoOptions = [
  {
    id: 'yes',
    value: true
  },
  {
    id: 'no',
    value: false
  }
]

/**
 * Produces a yes/no list of options with the specified
 * default value (true for yes, false for no).
 */
function YesNoOptions({ defaultValue }) {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  const options = basicYesNoOptions.map(({ id, value }) => ({
    text:
      id === 'yes'
        ? intl.formatMessage({ id: 'common.forms.yes' })
        : intl.formatMessage({ id: 'common.forms.no' }),
    value
  }))
  return <Options defaultValue={defaultValue} options={options} />
}

/**
 * Produces a list of duration options with the specified default value.
 */
function DurationOptions({ defaultValue, minuteOptions }) {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  const options = minuteOptions.map((minutes) => ({
    text:
      minutes === 60
        ? intl.formatMessage(
            { id: 'components.TripNotificationsPane.oneHour' },
            { minutes }
          )
        : intl.formatMessage(
            { id: 'common.time.tripDurationFormat' },
            { hours: 0, minutes }
          ),
    value: minutes
  }))
  return <Options defaultValue={defaultValue} options={options} />
}

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

  _handleDelayThresholdChange = (e) => {
    // To spare users the complexity of the departure/arrival delay thresholds,
    // set both the arrival and departure variance delays to the selected value.
    const { setFieldValue } = this.props
    const threshold = e.target.value
    setFieldValue('arrivalVarianceMinutesThreshold', threshold)
    setFieldValue('departureVarianceMinutesThreshold', threshold)
  }

  render() {
    const { intl, notificationChannel, values } = this.props
    const areNotificationsDisabled = notificationChannel === 'none'
    // Define a common trip delay field for simplicity, set to the smallest between the
    // retrieved departure/arrival delay attributes.
    const commonDelayThreshold = Math.min(
      values.arrivalVarianceMinutesThreshold,
      values.departureVarianceMinutesThreshold
    )

    let notificationSettingsContent
    if (areNotificationsDisabled) {
      notificationSettingsContent = (
        <Alert bsStyle="warning">
          <p>
            <IconWithText Icon={ExclamationTriangle}>
              <strong>
                <FormattedMessage id="components.TripNotificationsPane.notificationsTurnedOff" />
              </strong>
            </IconWithText>
          </p>
          <p>
            <FormattedMessage id="components.TripNotificationsPane.howToReceiveAlerts" />
          </p>
        </Alert>
      )
    } else {
      const { showAdvancedSettings } = this.state
      notificationSettingsContent = (
        <>
          <h4>
            <FormattedMessage
              id="components.TripNotificationsPane.notifyViaChannelWhen"
              values={
                notificationChannel === 'email'
                  ? {
                      channel: (
                        <FormattedMessage id="common.notifications.email" />
                      )
                    }
                  : {
                      channel: (
                        <FormattedMessage id="common.notifications.sms" />
                      )
                    }
              }
            />
          </h4>
          <SettingsListWithAlign>
            <li>
              <Select
                label={
                  <FormattedMessage id="components.TripNotificationsPane.realtimeAlertFlagged" />
                }
                name="notifyOnAlert"
              >
                <YesNoOptions defaultValue />
              </Select>
            </li>
            <li>
              <Select
                label={
                  <FormattedMessage id="components.TripNotificationsPane.altRouteRecommended" />
                }
                name="notifyOnItineraryChange"
              >
                <YesNoOptions defaultValue />
              </Select>
            </li>
            <li>
              <label htmlFor="commonDelayThreshold">
                <FormattedMessage id="components.TripNotificationsPane.delaysAboveThreshold" />
              </label>
              <FormControl
                componentClass="select"
                id="commonDelayThreshold"
                // Special event handler, hence not using <Select> as above.
                onChange={this._handleDelayThresholdChange}
                value={commonDelayThreshold}
              >
                <DurationOptions defaultValue={5} minuteOptions={[5, 10, 15]} />
              </FormControl>
            </li>
          </SettingsListWithAlign>

          <h4>
            <SettingsToggle
              aria-expanded={showAdvancedSettings}
              aria-label={intl.formatMessage({
                id: 'components.TripNotificationsPane.toggleAdvancedSettings'
              })}
              onClick={this._handleToggleAdvancedSettings}
              type="button"
            >
              <StyledIconWrapper>
                {showAdvancedSettings ? <CaretDown /> : <CaretRight />}
              </StyledIconWrapper>
              <FormattedMessage id="components.TripNotificationsPane.advancedSettings" />
            </SettingsToggle>
          </h4>
          {showAdvancedSettings && (
            <SettingsList>
              <li>
                <label htmlFor="leadTimeInMinutes">
                  <FormattedMessage
                    id="components.TripNotificationsPane.monitorThisTrip"
                    values={{
                      minutes: (
                        <Select
                          Control={InlineFormControl}
                          name="leadTimeInMinutes"
                        >
                          <DurationOptions
                            defaultValue={30}
                            minuteOptions={[15, 30, 45, 60]}
                          />
                        </Select>
                      )
                    }}
                  />
                </label>
              </li>
            </SettingsList>
          )}
        </>
      )
    }

    return <div>{notificationSettingsContent}</div>
  }
}

export default injectIntl(TripNotificationsPane)
