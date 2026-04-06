import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  Radio
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { Field, FormikProps } from 'formik'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Prompt } from 'react-router'
// @ts-expect-error FormikErrorFocus does not support TypeScript yet.
import FormikErrorFocus from 'formik-error-focus'
import React, { Component, FormEventHandler } from 'react'
import styled from 'styled-components'
import type { WrappedComponentProps } from 'react-intl'

import * as userActions from '../../../actions/user'
import {
  ALL_DAYS,
  arrayToDayFields,
  dayFieldsToArray
} from '../../../util/monitored-trip'
import { AppReduxState } from '../../../util/state-types'
import { getErrorStates } from '../../../util/ui'
import { ItineraryExistence, MonitoredTrip } from '../types'
import { RED_ON_WHITE } from '../../util/colors'
import FormattedValidationError from '../../util/formatted-validation-error'

import TripMonitoredDaySelector, {
  isDisabled
} from './trip-monitored-day-selector'
import TripStatus from './trip-status'
import TripSummaryPane from './trip-summary-pane'

type TripBasicsProps = WrappedComponentProps &
  FormikProps<MonitoredTrip> & {
    canceled: boolean
    checkItineraryExistence: (
      monitoredTrip: MonitoredTrip
    ) => Promise<ItineraryExistence>
    disableSingleItineraryDays?: boolean
    isCreating: boolean
    isReadOnly: boolean
    setIsLoading?: (arg: boolean) => void
  }

interface State {
  fetchedItineraryExistence: ItineraryExistence | null
  isRecheckingExistence: boolean
  selectedDays: string[] | null
}

const TripSummaryContainer = styled.div`
  margin: 3em 0;
`

const RequiredIndicator = styled.span`
  color: ${RED_ON_WHITE};
  margin-left: 5px;
`

/**
 * This component shows summary information for a trip
 * and lets the user edit the trip name and monitored day.
 */
class TripBasicsPane extends Component<TripBasicsProps, State> {
  constructor(props: TripBasicsProps) {
    super(props)
    this.state = {
      fetchedItineraryExistence: null,
      isRecheckingExistence: false,
      selectedDays: null
    }
  }

  _getDaysFromItineraryExistence = () => {
    const itineraryExistence = this.state.fetchedItineraryExistence
    return ALL_DAYS.filter((day) => itineraryExistence?.[day]?.valid)
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

  componentDidMount() {
    // Check itinerary availability (existence) for all days if not already done.
    const { values: monitoredTrip } = this.props
    if (!monitoredTrip.itineraryExistence) {
      this._handleRecheckItineraryExistence()
    } else {
      this.setState({
        fetchedItineraryExistence: monitoredTrip.itineraryExistence
      })
    }
  }

  _handleRecheckItineraryExistence = async () => {
    this.setState({ isRecheckingExistence: true })
    // Check itinerary availability (existence) for all days if not already done.
    const {
      checkItineraryExistence,
      intl,
      setFieldValue,
      setIsLoading,
      values: monitoredTrip
    } = this.props
    setIsLoading && setIsLoading(true)
    const newExistence = await checkItineraryExistence(monitoredTrip)
    this.setState({
      fetchedItineraryExistence: newExistence
    })
    if (!newExistence) {
      alert(
        intl.formatMessage({ id: 'actions.user.itineraryExistenceCheckFailed' })
      )
    }
    setIsLoading && setIsLoading(false)
    this.setState({ isRecheckingExistence: false })
    ALL_DAYS.forEach((day) => {
      if (isDisabled(day, newExistence)) {
        setFieldValue(day, false)
      }
    })
  }

  // eslint-disable-next-line complexity
  render() {
    const {
      canceled,
      dirty,
      disableSingleItineraryDays,
      errors,
      intl,
      isCreating,
      isReadOnly,
      isSubmitting,
      values: monitoredTrip
    } = this.props
    const { itinerary } = monitoredTrip
    const { fetchedItineraryExistence, isRecheckingExistence } = this.state
    const finalItineraryExistence = isRecheckingExistence
      ? undefined
      : fetchedItineraryExistence

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

      const { from, to } = monitoredTrip
      /* Hack: because the selected days checkboxes are not grouped, we need to assign this error to one of the 
      checkboxes so that the FormikErrorFocus works. */
      const selectOneDayError = errorStates.monday
      const dayButtons = (
        <>
          <TripMonitoredDaySelector
            errorCheckingTrip={errorCheckingTrip}
            errorSelectingDays={
              disableSingleItineraryDays ? selectOneDayError : undefined
            }
            finalItineraryExistence={finalItineraryExistence}
            isReadOnly={isReadOnly}
            monitoredTrip={monitoredTrip}
          />
          {!isCreating && (
            <Button
              disabled={isRecheckingExistence}
              onClick={this._handleRecheckItineraryExistence}
            >
              Check again
            </Button>
          )}
        </>
      )

      return (
        <div>
          {/* TODO: This component does not block navigation on reload or using the back button.
          This will have to be done at a higher level. See #376 */}
          <Prompt message={unsavedChangesMessage} when={unsavedChanges} />
          <FormGroup validationState={errorStates.tripName}>
            <ControlLabel htmlFor="tripName">
              <FormattedMessage id="components.TripBasicsPane.tripNamePrompt" />
              {!isReadOnly && <RequiredIndicator>*</RequiredIndicator>}
            </ControlLabel>
            {/* onBlur, onChange, and value are passed automatically. */}
            <Field
              aria-invalid={!!errorStates.tripName}
              as={FormControl}
              disabled={isReadOnly}
              id="tripName"
              name="tripName"
              required
            />
            <FormControl.Feedback />
            <HelpBlock role="alert">
              {errors.tripName && (
                <FormattedValidationError type={errors.tripName} />
              )}
            </HelpBlock>
          </FormGroup>

          {/* Do not show trip status when saving trip for the first time
              (it doesn't exist in backend yet). */}
          {!isCreating && (
            <TripStatus isReadOnly={isReadOnly} monitoredTrip={monitoredTrip} />
          )}
          <TripSummaryContainer>
            <TripSummaryPane
              from={from}
              isEditingTrip
              monitoredTrip={monitoredTrip}
              to={to}
            />
          </TripSummaryContainer>

          {disableSingleItineraryDays ? (
            <FormGroup validationState={selectOneDayError}>
              <ControlLabel>
                <FormattedMessage id="components.TripBasicsPane.tripDaysPrompt" />
                {!isReadOnly && <RequiredIndicator>*</RequiredIndicator>}
              </ControlLabel>
              {dayButtons}
            </FormGroup>
          ) : (
            <FormGroup>
              <ControlLabel>
                <FormattedMessage id="components.TripBasicsPane.tripDaysPrompt" />
              </ControlLabel>
              <Radio
                checked={!isOneTime}
                disabled={errorCheckingTrip || isReadOnly}
                onChange={this._handleRecurringTrip}
              >
                <FormattedMessage id="components.TripBasicsPane.recurringEachWeek" />
              </Radio>
              {!isOneTime && dayButtons}
              <Radio
                checked={isOneTime}
                disabled={isReadOnly}
                onChange={this._handleOneTimeTrip}
              >
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
  const { disableSingleItineraryDays } = state.otp.config
  return {
    disableSingleItineraryDays
  }
}

const mapDispatchToProps = {
  checkItineraryExistence: userActions.checkItineraryExistence
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TripBasicsPane))
