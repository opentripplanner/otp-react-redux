import { Ban } from '@styled-icons/fa-solid/Ban'
import { connect } from 'react-redux'
import {
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  ProgressBar,
  Radio
} from 'react-bootstrap'
import { Field, FormikProps } from 'formik'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Prompt } from 'react-router'
// @ts-expect-error FormikErrorFocus does not support TypeScript yet.
import FormikErrorFocus from 'formik-error-focus'
import React, { Component, FormEventHandler } from 'react'
import styled from 'styled-components'
import type { IntlShape, WrappedComponentProps } from 'react-intl'

import * as userActions from '../../../actions/user'
import {
  ALL_DAYS,
  arrayToDayFields,
  dayFieldsToArray,
  getFormattedDayOfWeekPlural
} from '../../../util/monitored-trip'
import { AppReduxState } from '../../../util/state-types'
import { FieldSet } from '../styled'
import { getBaseColor, RED_ON_WHITE } from '../../util/colors'
import { getErrorStates } from '../../../util/ui'
import { ItineraryExistence, MonitoredTrip } from '../types'
import FormattedDayOfWeek from '../../util/formatted-day-of-week'
import FormattedDayOfWeekCompact from '../../util/formatted-day-of-week-compact'
import FormattedValidationError from '../../util/formatted-validation-error'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import { MonitoredDayCircle } from './trip-monitored-days'
import TripStatus from './trip-status'
import TripSummary from './trip-duration-summary'

type TripBasicsProps = WrappedComponentProps &
  FormikProps<MonitoredTrip> & {
    canceled: boolean
    checkItineraryExistence: (
      monitoredTrip: MonitoredTrip,
      intl: IntlShape
    ) => void
    clearItineraryExistence: () => void
    disableSingleItineraryDays?: boolean
    isCreating: boolean
    itineraryExistence?: ItineraryExistence
  }

interface State {
  selectedDays: string[] | null
}

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

function isDisabled(day: string, itineraryExistence?: ItineraryExistence) {
  return itineraryExistence && !itineraryExistence[day]?.valid
}

/**
 * This component shows summary information for a trip
 * and lets the user edit the trip name and day.
 */
class TripBasicsPane extends Component<TripBasicsProps, State> {
  state = {
    selectedDays: null
  }

  /**
   * For new trips only, update the Formik state to
   * uncheck days for which the itinerary is not available.
   */
  _updateNewTripItineraryExistence = (prevProps: TripBasicsProps) => {
    const { isCreating, itineraryExistence, setFieldValue } = this.props

    if (
      isCreating &&
      itineraryExistence &&
      itineraryExistence !== prevProps.itineraryExistence
    ) {
      ALL_DAYS.forEach((day) => {
        if (!itineraryExistence[day].valid) {
          setFieldValue(day, false)
        }
      })
    }
  }

  _getDaysFromItineraryExistence = () => {
    const { itineraryExistence, values: trip } = this.props
    const finalItineraryExistence =
      trip.itineraryExistence || itineraryExistence
    return ALL_DAYS.filter((day) => finalItineraryExistence?.[day]?.valid)
  }

  _handleRecurringTrip: FormEventHandler<Radio> = (e) => {
    const input = e.target as HTMLInputElement
    if (input.checked) {
      const { setValues, values } = this.props
      const { selectedDays } = this.state

      // Restore previously checked monitored days.
      // If none were set, use the itinerary existence values (at least one day should exist in there).
      setValues({
        ...values,
        ...arrayToDayFields(
          selectedDays || this._getDaysFromItineraryExistence()
        )
      })
    }
  }

  _handleOneTimeTrip: FormEventHandler<Radio> = (e) => {
    const input = e.target as HTMLInputElement
    if (input.checked) {
      const { setValues, values } = this.props
      // Hold on to monitored days
      this.setState({ selectedDays: dayFieldsToArray(values) })

      // Uncheck all monitored days
      setValues({
        ...values,
        ...arrayToDayFields([])
      })
    }
  }

  RenderAvailableDays = ({
    errorCheckingTrip,
    errorSelectingDays,
    finalItineraryExistence,
    intl,
    isCreating,
    monitoredTrip
  }: {
    errorCheckingTrip: boolean
    errorSelectingDays?: 'error' | null
    finalItineraryExistence: ItineraryExistence | undefined
    intl: IntlShape
    isCreating: boolean
    monitoredTrip: MonitoredTrip
  }) => (
    <>
      {errorCheckingTrip && (
        <>
          {/* FIXME: Temporary solution until itinerary existence check is fixed. */}
          <br />
          <FormattedMessage id="actions.user.itineraryExistenceCheckFailed" />
        </>
      )}
      <AvailableDays>
        <>
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

            const baseColor = getBaseColor()
            return (
              <MonitoredDayCircle
                baseColor={baseColor}
                key={day}
                monitored={!isDayDisabled && monitoredTrip[day]}
                title={notAvailableText}
              >
                <Field
                  // Let users save an existing trip, even though it may not be available on some days.
                  // TODO: improve checking trip availability.
                  disabled={isDayDisabled && isCreating}
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
        </>
      </AvailableDays>

      <HelpBlock role="status">
        {finalItineraryExistence ? (
          <FormattedMessage id="components.TripBasicsPane.tripIsAvailableOnDaysIndicated" />
        ) : (
          <ProgressBar
            active
            label={
              <FormattedMessage id="components.TripBasicsPane.checkingItineraryExistence" />
            }
            now={100}
          />
        )}
      </HelpBlock>
      <HelpBlock role="alert">
        {errorSelectingDays && (
          <FormattedValidationError type="select-at-least-one-day" />
        )}
      </HelpBlock>
    </>
  )

  componentDidMount() {
    // Check itinerary availability (existence) for all days if not already done.
    const { checkItineraryExistence, intl, values: monitoredTrip } = this.props
    if (!monitoredTrip.itineraryExistence) {
      checkItineraryExistence(monitoredTrip, intl)
    }
  }

  componentDidUpdate(prevProps: TripBasicsProps) {
    this._updateNewTripItineraryExistence(prevProps)
  }

  componentWillUnmount() {
    this.props.clearItineraryExistence()
  }

  render() {
    const {
      canceled,
      dirty,
      disableSingleItineraryDays,
      errors,
      intl,
      isCreating,
      isSubmitting,
      itineraryExistence,
      values: monitoredTrip
    } = this.props
    const { itinerary } = monitoredTrip
    const finalItineraryExistence =
      monitoredTrip.itineraryExistence || itineraryExistence

    // Prevent user from leaving when form has been changed,
    // but don't show it when they click submit or cancel.
    const unsavedChanges = dirty && !isSubmitting && !canceled
    // Message changes depending on if the new or existing trip is being edited
    const unsavedChangesMessage = isCreating
      ? intl.formatMessage({
          id: 'components.TripBasicsPane.unsavedChangesNewTrip'
        })
      : intl.formatMessage({
          id: 'components.TripBasicsPane.unsavedChangesExistingTrip'
        })

    if (!itinerary) {
      return (
        <div>
          <FormattedMessage id="common.itineraryDescriptions.noItineraryToDisplay" />
        </div>
      )
    } else {
      // Show an error indication when monitoredTrip.tripName is not blank, or that tripName is already used.
      const errorStates = getErrorStates(this.props)
      const monitoredDays = dayFieldsToArray(monitoredTrip)
      const isOneTime = monitoredDays.length === 0
      const errorCheckingTrip = ALL_DAYS.every((day) =>
        isDisabled(day, finalItineraryExistence)
      )
      /* Hack: because the selected days checkboxes are not grouped, we need to assign this error to one of the 
      checkboxes so that the FormikErrorFocus works. */
      const selectOneDayError = errorStates.monday
      return (
        <div>
          {/* TODO: This component does not block navigation on reload or using the back button.
          This will have to be done at a higher level. See #376 */}
          <Prompt message={unsavedChangesMessage} when={unsavedChanges} />

          {/* Do not show trip status when saving trip for the first time
              (it doesn't exist in backend yet). */}
          {!isCreating && <TripStatus monitoredTrip={monitoredTrip} />}
          <TripSummary monitoredTrip={monitoredTrip} />

          <FormGroup validationState={errorStates.tripName}>
            <ControlLabel htmlFor="tripName">
              <FormattedMessage id="components.TripBasicsPane.tripNamePrompt" />
            </ControlLabel>
            {/* onBlur, onChange, and value are passed automatically. */}
            <Field
              aria-invalid={!!errorStates.tripName}
              as={FormControl}
              id="tripName"
              name="tripName"
            />
            <FormControl.Feedback />
            <HelpBlock role="alert">
              {errors.tripName && (
                <FormattedValidationError type={errors.tripName} />
              )}
            </HelpBlock>
          </FormGroup>
          {disableSingleItineraryDays ? (
            <FormGroup validationState={selectOneDayError}>
              <ControlLabel>
                <FormattedMessage id="components.TripBasicsPane.tripDaysPrompt" />
              </ControlLabel>
              <this.RenderAvailableDays
                errorCheckingTrip={errorCheckingTrip}
                errorSelectingDays={selectOneDayError}
                finalItineraryExistence={finalItineraryExistence}
                intl={intl}
                isCreating={isCreating}
                monitoredTrip={monitoredTrip}
              />
            </FormGroup>
          ) : (
            <FormGroup>
              <ControlLabel>
                <FormattedMessage id="components.TripBasicsPane.tripDaysPrompt" />
              </ControlLabel>
              <Radio
                checked={!isOneTime}
                // FIXME: Temporary solution until itinerary existence check is fixed.
                disabled={errorCheckingTrip}
                onChange={this._handleRecurringTrip}
              >
                <FormattedMessage id="components.TripBasicsPane.recurringEachWeek" />
              </Radio>
              {!isOneTime && (
                <>
                  <this.RenderAvailableDays
                    errorCheckingTrip={errorCheckingTrip}
                    finalItineraryExistence={finalItineraryExistence}
                    intl={intl}
                    isCreating={isCreating}
                    monitoredTrip={monitoredTrip}
                  />
                </>
              )}
              <Radio checked={isOneTime} onChange={this._handleOneTimeTrip}>
                <FormattedMessage
                  id="components.TripBasicsPane.onlyOnDate"
                  values={{ date: itinerary.startTime }}
                />
              </Radio>
            </FormGroup>
          )}

          {/* Scroll to the trip name/days fields if submitting and there is an error on these fields. */}
          <FormikErrorFocus align="middle" duration={200} />
        </div>
      )
    }
  }
}

// Connect to redux store

const mapStateToProps = (state: AppReduxState) => {
  const { itineraryExistence } = state.user
  const { disableSingleItineraryDays } = state.otp.config
  return {
    disableSingleItineraryDays,
    itineraryExistence
  }
}

const mapDispatchToProps = {
  checkItineraryExistence: userActions.checkItineraryExistence,
  clearItineraryExistence: userActions.clearItineraryExistence
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TripBasicsPane))
