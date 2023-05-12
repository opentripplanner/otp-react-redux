import { Alert, FormControl } from 'react-bootstrap'
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { Field, FormikProps } from 'formik'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import React, { Component, ComponentType, FormEvent, ReactNode } from 'react'
import styled from 'styled-components'

import { FieldSet } from '../styled'
import { IconWithText } from '../../util/styledIcon'

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

/**
 * A label followed by a dropdown control.
 */
const Select = ({
  Control = FormControl,
  children,
  label,
  name
}: {
  // Note the prop order required by typescript-sort-keys, also applied above.
  Control?: ComponentType
  children: ReactNode
  label?: ReactNode
  name: string
}) => (
  // <Field> is kept outside of <label> to accommodate layout in table/grid cells.
  <>
    {label && <label htmlFor={name}>{label}</label>}
    <Field as={Control} componentClass="select" id={name} name={name}>
      {children}
    </Field>
  </>
)

function Options({
  defaultValue,
  options
}: {
  defaultValue: number | string
  options: { text: string; value: number | string }[]
}) {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  return (
    <>
      {options.map(({ text, value }, i) => (
        <option key={i} value={value}>
          {value === defaultValue
            ? intl.formatMessage(
                { id: 'common.forms.defaultValue' },
                { value: text }
              )
            : text}
        </option>
      ))}
    </>
  )
}

const basicYesNoOptions = [
  {
    id: 'yes',
    value: 'true'
  },
  {
    id: 'no',
    value: 'false'
  }
]

/**
 * Produces a yes/no list of options with the specified
 * default value (true for yes, false for no).
 */
function YesNoOptions({ defaultValue }: { defaultValue: boolean }) {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  const options = basicYesNoOptions.map(({ id, value }) => ({
    text:
      id === 'yes'
        ? intl.formatMessage({ id: 'common.forms.yes' })
        : intl.formatMessage({ id: 'common.forms.no' }),
    value
  }))
  return (
    <Options
      defaultValue={(defaultValue || false).toString()}
      options={options}
    />
  )
}

/**
 * Produces a list of duration options with the specified default value.
 */
function DurationOptions({
  decoratorFunc,
  defaultValue,
  minuteOptions
}: {
  decoratorFunc?: (text: string, intl: IntlShape) => string
  defaultValue: string | number
  minuteOptions: number[]
}) {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  const localizedMinutes = minuteOptions.map((minutes) => ({
    text:
      minutes === 60
        ? intl.formatMessage({ id: 'components.TripNotificationsPane.oneHour' })
        : intl.formatMessage(
            { id: 'common.time.tripDurationFormat' },
            { hours: 0, minutes, seconds: 0 }
          ),
    value: minutes
  }))
  const options = decoratorFunc
    ? localizedMinutes.map(({ text, value }) => ({
        text: decoratorFunc(text, intl),
        value
      }))
    : localizedMinutes
  return <Options defaultValue={defaultValue} options={options} />
}

interface Fields {
  arrivalVarianceMinutesThreshold: number
  departureVarianceMinutesThreshold: number
}

interface Props extends FormikProps<Fields> {
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
      notificationSettingsContent = (
        <FieldSet>
          <legend>
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
                <DurationOptions defaultValue={5} minuteOptions={[5, 10, 15]} />
              </FormControl>
            </li>
          </SettingsList>

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
