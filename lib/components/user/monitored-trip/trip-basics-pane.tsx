import { connect } from 'react-redux'
import {
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  HelpBlock,
  ProgressBar
} from 'react-bootstrap'
import { Field, FormikProps } from 'formik'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Prompt } from 'react-router'
import FormikErrorFocus from 'formik-error-focus'
import React, { Component } from 'react'
import styled from 'styled-components'
import type { IntlShape, WrappedComponentProps } from 'react-intl'

import * as userActions from '../../../actions/user'
import {
  ALL_DAYS,
  getFormattedDayOfWeekPlural
} from '../../../util/monitored-trip'
import { AppReduxState } from '../../../util/state-types'
import { FieldSet } from '../styled'
import { getErrorStates } from '../../../util/ui'
import { ItineraryExistence, MonitoredTrip } from '../types'
import FormattedDayOfWeek from '../../util/formatted-day-of-week'
import FormattedDayOfWeekCompact from '../../util/formatted-day-of-week-compact'
import FormattedValidationError from '../../util/formatted-validation-error'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import TripStatus from './trip-status'
import TripSummary from './trip-summary'

type TripBasicsProps = WrappedComponentProps &
  FormikProps<MonitoredTrip> & {
    canceled: boolean
    checkItineraryExistence: (
      monitoredTrip: MonitoredTrip,
      intl: IntlShape
    ) => void
    clearItineraryExistence: () => void
    isCreating: boolean
    itineraryExistence?: ItineraryExistence
  }

// FIXME: move to shared types file
type ErrorStates = 'success' | 'warning' | 'error' | null | undefined

// Styles.
const AvailableDays = styled(FieldSet)`
  & > span {
    border: 1px solid #ccc;
    border-left: none;
    box-sizing: border-box;
    display: inline-block;
    height: 3em;
    max-width: 150px;
    min-width: 14.28%;
    position: relative;
    text-align: center;
  }
  & > span:first-of-type {
    border-left: 1px solid #ccc;
  }

  .glyphicon {
    display: none;
    /* Remove top attribute set by Bootstrap. */
    top: inherit;
  }

  input {
    display: block;
  }

  input,
  .glyphicon {
    bottom: 6px;
    position: absolute;
    width: 100%;
  }

  /* Check boxes for disabled days are replaced with the cross mark. */
  input[disabled] {
    clip: rect(0, 0, 0, 0);
    height: 0;
    margin: 0;
    width: 0;
    z-index: -1;
  }
  input[disabled] ~ .glyphicon {
    display: block;
  }

  /* Make labels occupy the whole space, so the entire block is clickable. */
  label {
    font-weight: inherit;
    height: 100%;
    width: 100%;
  }
`

/**
 * This component shows summary information for a trip
 * and lets the user edit the trip name and day.
 */
class TripBasicsPane extends Component<TripBasicsProps> {
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
      // Show an error indication when
      // - monitoredTrip.tripName is not blank and that tripName is not already used.
      // - no day is selected (show a combined error indication).
      const errorStates = getErrorStates(this.props)

      let monitoredDaysValidationState: ErrorStates = null
      ALL_DAYS.forEach((day) => {
        if (!monitoredDaysValidationState) {
          monitoredDaysValidationState = errorStates[day]
        }
      })

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

          <FormGroup validationState={monitoredDaysValidationState}>
            <AvailableDays>
              <legend className="control-label">
                <FormattedMessage id="components.TripBasicsPane.tripDaysPrompt" />
              </legend>
              {ALL_DAYS.map((day) => {
                const isDayDisabled =
                  finalItineraryExistence &&
                  !finalItineraryExistence[day]?.valid
                const boxClass = isDayDisabled
                  ? 'alert-danger'
                  : monitoredTrip[day]
                  ? 'bg-primary'
                  : ''
                const notAvailableText = isDayDisabled
                  ? intl.formatMessage(
                      { id: 'components.TripBasicsPane.tripNotAvailableOnDay' },
                      { repeatedDay: getFormattedDayOfWeekPlural(day, intl) }
                    )
                  : ''

                return (
                  <span className={boxClass} key={day} title={notAvailableText}>
                    <Field
                      aria-invalid={!!monitoredDaysValidationState}
                      // Let users save an existing trip, even though it may not be available on some days.
                      // TODO: improve checking trip availability.
                      disabled={isDayDisabled && isCreating}
                      id={day}
                      name={day}
                      type="checkbox"
                    />
                    <label htmlFor={day}>
                      <InvisibleA11yLabel>
                        <FormattedDayOfWeek day={day} />
                      </InvisibleA11yLabel>
                      <span aria-hidden>
                        {/* The abbreviated text is visual only. Screen readers should read out the full day. */}
                        <FormattedDayOfWeekCompact day={day} />
                      </span>
                    </label>
                    <Glyphicon aria-hidden glyph="ban-circle" />
                    <InvisibleA11yLabel>{notAvailableText}</InvisibleA11yLabel>
                  </span>
                )
              })}
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
              {monitoredDaysValidationState && (
                <FormattedMessage id="components.TripBasicsPane.selectAtLeastOneDay" />
              )}
            </HelpBlock>

            {/* Scroll to the trip name/days fields if submitting and there is an error on these fields. */}
            <FormikErrorFocus align="middle" duration={200} />
          </FormGroup>
        </div>
      )
    }
  }
}

// Connect to redux store

const mapStateToProps = (state: AppReduxState) => {
  const { itineraryExistence } = state.user
  return {
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
