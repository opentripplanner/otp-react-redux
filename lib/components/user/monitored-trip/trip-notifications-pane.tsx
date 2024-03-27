import { Alert, FormControl } from 'react-bootstrap'
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { FormattedList, FormattedMessage } from 'react-intl'
import { FormikProps } from 'formik'
import { Leg } from '@opentripplanner/types'
import React, { Component, FormEvent } from 'react'
import styled from 'styled-components'

import {
  DurationOptions,
  Select,
  YesNoOptions
} from '../common/dropdown-options'
import { FieldSet } from '../styled'
import { IconWithText } from '../../util/styledIcon'
import { MonitoredTrip } from '../types'

// Element styles
const SettingsList = styled.ul`
  border-spacing: 0 10px;
  display: table;
  padding-left: 0;
  width: 100%;
  label {
    font-weight: inherit;
    padding-right: 10px;
  }
  /* Use table display for this element, so that all dropdowns occupy the same width.
    (Bootstrap already sets them to occupy 100% of the width of the parent, i.e. the logical cell.) */
  & > li {
    align-items: center;
    display: table-row;
    & > * {
      display: table-cell;
    }
  }
`

const Summary = styled.summary`
  /* Revert display:block set by Bootstrap that hides the native expand/collapse caret. */
  display: revert-layer;
  /* Format summary as labels */
  font-weight: 700;
  margin-bottom: 5px;
`

interface Props extends FormikProps<MonitoredTrip> {
  notificationChannel: string
}

/**
 * This component wraps the elements to edit trip notification settings.
 */
class TripNotificationsPane extends Component<Props> {
  _handleDelayThresholdChange = (e: FormEvent<FormControl>): void => {
    // To spare users the complexity of the departure/arrival delay thresholds,
    // set both the arrival and departure variance delays to the selected value.
    const { setFieldValue } = this.props
    const target = e.target as HTMLSelectElement
    if (target) {
      const threshold = target.value
      setFieldValue('arrivalVarianceMinutesThreshold', threshold)
      setFieldValue('departureVarianceMinutesThreshold', threshold)
    }
  }

  render(): JSX.Element {
    const { notificationChannel, values } = this.props
    const areNotificationsDisabled =
      notificationChannel === 'none' || !notificationChannel?.length
    // Define a common trip delay field for simplicity, set to the smallest between the
    // retrieved departure/arrival delay attributes.
    const commonDelayThreshold = Math.min(
      values.arrivalVarianceMinutesThreshold,
      values.departureVarianceMinutesThreshold
    )
    const hasTransit = values.itinerary?.legs?.some(
      (leg: Leg) => leg.transitLeg
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
      const selectedChannels = notificationChannel
        .split(',')
        .filter((channel) => channel?.length)
        .map((channel) => (
          <FormattedMessage
            id={`common.notifications.${channel}`}
            key={channel}
          />
        ))
      notificationSettingsContent = (
        <FieldSet>
          {hasTransit ? (
            <>
              <legend>
                <FormattedMessage
                  id="components.TripNotificationsPane.notifyViaChannelWhen"
                  values={{
                    channel: (
                      <FormattedList
                        type="conjunction"
                        value={selectedChannels}
                      />
                    )
                  }}
                />
              </legend>
              <SettingsList>
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
                    <DurationOptions
                      defaultValue={5}
                      minuteOptions={[5, 10, 15]}
                    />
                  </FormControl>
                </li>
              </SettingsList>
            </>
          ) : null}

          <details>
            <Summary>
              <FormattedMessage id="components.TripNotificationsPane.advancedSettings" />
            </Summary>
            <SettingsList>
              <li>
                <Select
                  label={
                    <FormattedMessage id="components.TripNotificationsPane.monitorThisTrip" />
                  }
                  name="leadTimeInMinutes"
                >
                  <DurationOptions
                    decoratorFunc={(time, intl) => {
                      return intl.formatMessage(
                        { id: 'components.TripNotificationsPane.timeBefore' },
                        { time }
                      )
                    }}
                    defaultValue={30}
                    minuteOptions={[15, 30, 45, 60]}
                  />
                </Select>
              </li>
            </SettingsList>
          </details>
        </FieldSet>
      )
    }

    return <div>{notificationSettingsContent}</div>
  }
}

export default TripNotificationsPane
