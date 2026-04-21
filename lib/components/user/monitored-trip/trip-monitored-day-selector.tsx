import { Ban } from '@styled-icons/fa-solid/Ban'
import { Field } from 'formik'
import { FormattedMessage, useIntl } from 'react-intl'
import { HelpBlock, ProgressBar } from 'react-bootstrap'
import React from 'react'
import styled from 'styled-components'

import {
  ALL_DAYS,
  dayFieldsToArray,
  getFormattedDayOfWeekPlural
} from '../../../util/monitored-trip'
import { FieldSet } from '../styled'
import { getBaseColor, RED_ON_WHITE } from '../../util/colors'
import { ItineraryExistence, MonitoredTrip } from '../types'
import FormattedDayOfWeek from '../../util/formatted-day-of-week'
import FormattedDayOfWeekCompact from '../../util/formatted-day-of-week-compact'
import FormattedValidationError from '../../util/formatted-validation-error'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import MonitoredDays, { MonitoredDayCircle } from './trip-monitored-days'

// Styles.
const AvailableDays = styled(FieldSet)`
  display: flex;
  gap: 4px;

  // Targets the formik checkboxes to provide better contrast on focus styles
  input {
    &:focus-visible,
    &:focus {
      outline-offset: 0.5px;
      outline: solid 2px blue;
      &:checked {
        outline: solid 2px white;
      }
    }
  }
  & > span {
    align-items: center;
    border-radius: 3rem;
    box-sizing: border-box;
    display: inline-flex;
    flex-direction: row-reverse;
    height: 3rem;
    min-width: 4.5rem;
    position: relative;
    text-align: center;
    width: 5rem;
  }
  svg {
    color: ${RED_ON_WHITE};
    display: none;
    /* Remove top attribute set by Bootstrap. */
    top: inherit;
    width: 1.3rem;
  }

  input,
  svg {
    flex-shrink: 0;
    /* Remove bootstrap's vertical margin */
    margin: 0 7px 0 2px;
  }

  /* Check boxes for disabled days are replaced with the cross mark. */
  input[disabled] {
    display: none;
  }
  input[disabled] ~ svg {
    display: block;
  }

  /* Add oblique strike for disabled days */
  .disabled-day::after {
    border-top: 2px solid ${RED_ON_WHITE};
    content: '';
    left: 0;
    position: absolute;
    right: 0;
    top: 45%;
    transform: rotate(-30deg);
    transform-origin: center;
  }

  label {
    flex-grow: 1;
    font-weight: inherit;
    height: 100%;
    line-height: 3rem;
    margin: 0;
    position: relative;
    text-align: center;
  }
`

export function isDisabled(
  day: string,
  itineraryExistence?: ItineraryExistence | null
): boolean {
  return !!(itineraryExistence && !itineraryExistence[day]?.valid)
}

const TripMonitoredDaySelector = ({
  errorCheckingTrip,
  errorSelectingDays,
  finalItineraryExistence,
  isReadOnly,
  monitoredTrip
}: {
  errorCheckingTrip: boolean
  errorSelectingDays?: 'error' | null
  finalItineraryExistence?: ItineraryExistence | null
  isReadOnly: boolean
  monitoredTrip: MonitoredTrip
}): JSX.Element => {
  const intl = useIntl()
  const baseColor = getBaseColor()

  if (isReadOnly) {
    return <MonitoredDays days={dayFieldsToArray(monitoredTrip)} />
  }

  return (
    <>
      {errorCheckingTrip && (
        <>
          {/* FIXME: Temporary solution until itinerary existence check is fixed. */}
          <br />
          <FormattedMessage id="actions.user.itineraryExistenceCheckFailed" />
        </>
      )}
      <AvailableDays>
        {ALL_DAYS.map((day) => {
          const isDayDisabled = isDisabled(day, finalItineraryExistence)
          const labelClass = isDayDisabled ? 'disabled-day' : ''
          const notAvailableText = isDayDisabled
            ? intl.formatMessage(
                {
                  id: 'components.TripBasicsPane.tripNotAvailableOnDay'
                },
                {
                  repeatedDay: getFormattedDayOfWeekPlural(day, intl)
                }
              )
            : ''

          return (
            <MonitoredDayCircle
              baseColor={baseColor}
              key={day}
              monitored={!isDayDisabled && monitoredTrip[day]}
              title={notAvailableText}
            >
              <Field
                disabled={isDayDisabled}
                id={day}
                name={day}
                type="checkbox"
              />
              <Ban aria-hidden />
              <label htmlFor={day}>
                <InvisibleA11yLabel>
                  <FormattedDayOfWeek day={day} />
                </InvisibleA11yLabel>
                <span aria-hidden className={labelClass}>
                  {/* The abbreviated text is visual only. Screen readers should read out the full day. */}
                  <FormattedDayOfWeekCompact day={day} />
                </span>
              </label>
              <InvisibleA11yLabel>{notAvailableText}</InvisibleA11yLabel>
            </MonitoredDayCircle>
          )
        })}
      </AvailableDays>
      <HelpBlock role="status">
        {finalItineraryExistence ? (
          <FormattedMessage id="components.TripBasicsPane.tripIsAvailableOnDaysIndicated" />
        ) : (
          <>
            <InvisibleA11yLabel as="div">
              <FormattedMessage id="components.TripBasicsPane.checkingItineraryExistence" />
            </InvisibleA11yLabel>
            <ProgressBar
              active
              label={
                <FormattedMessage id="components.TripBasicsPane.checkingItineraryExistence" />
              }
              now={100}
            />
          </>
        )}
      </HelpBlock>
      <HelpBlock role="alert">
        {errorSelectingDays && (
          <FormattedValidationError type="select-at-least-one-day" />
        )}
      </HelpBlock>
    </>
  )
}

export default TripMonitoredDaySelector
