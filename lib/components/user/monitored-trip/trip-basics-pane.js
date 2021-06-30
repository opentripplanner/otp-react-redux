import { Field } from 'formik'
import FormikErrorFocus from 'formik-error-focus'
import React, { Component } from 'react'
import {
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  HelpBlock,
  ProgressBar
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { Prompt } from 'react-router'
import styled from 'styled-components'

import * as userActions from '../../../actions/user'
import { getErrorStates } from '../../../util/ui'

import TripStatus from './trip-status'
import TripSummary from './trip-summary'

// Styles.
const TripDayLabel = styled.label`
  border: 1px solid #ccc;
  border-left: none;
  box-sizing: border-box;
  display: inline-block;
  font-weight: inherit;
  float: left;
  height: 3em;
  max-width: 150px;
  min-width: 14.28%;
  text-align: center;
  & > span:first-of-type {
    display: block;
    width: 100%;
  }
  &:first-of-type {
    border-left: 1px solid #ccc;
  }
`

const allDays = [
  { name: 'monday', text: 'Mon.', fullText: 'Mondays' },
  { name: 'tuesday', text: 'Tue.', fullText: 'Tuesdays' },
  { name: 'wednesday', text: 'Wed.', fullText: 'Wednesdays' },
  { name: 'thursday', text: 'Thu.', fullText: 'Thursdays' },
  { name: 'friday', text: 'Fri.', fullText: 'Fridays' },
  { name: 'saturday', text: 'Sat.', fullText: 'Saturdays' },
  { name: 'sunday', text: 'Sun.', fullText: 'Sundays' }
]

/**
 * This component shows summary information for a trip
 * and lets the user edit the trip name and day.
 */
class TripBasicsPane extends Component {
  /**
   * For new trips only, update the Formik state to
   * uncheck days for which the itinerary is not available.
   */
  _updateNewTripItineraryExistence = prevProps => {
    const { isCreating, itineraryExistence, setFieldValue } = this.props

    if (isCreating &&
        itineraryExistence &&
        itineraryExistence !== prevProps.itineraryExistence
    ) {
      allDays.forEach(({ name }) => {
        if (!itineraryExistence[name].valid) {
          setFieldValue(name, false)
        }
      })
    }
  }

  componentDidMount () {
    // Check itinerary availability (existence) for all days.
    const { checkItineraryExistence, values: monitoredTrip } = this.props
    checkItineraryExistence(monitoredTrip)
  }

  componentDidUpdate (prevProps) {
    this._updateNewTripItineraryExistence(prevProps)
  }

  componentWillUnmount () {
    this.props.clearItineraryExistence()
  }

  render () {
    const { errors, isCreating, itineraryExistence, values: monitoredTrip } = this.props
    const { itinerary } = monitoredTrip

    if (!itinerary) {
      return <div>No itinerary to display.</div>
    } else {
      // Show an error indication when
      // - monitoredTrip.tripName is not blank and that tripName is not already used.
      // - no day is selected (show a combined error indication).
      const errorStates = getErrorStates(this.props)

      let monitoredDaysValidationState = null
      allDays.forEach(({ name }) => {
        if (!monitoredDaysValidationState) {
          monitoredDaysValidationState = errorStates[name]
        }
      })

      return (
        <div>
          {/* Prevent user from leaving when form is dirty */}
          <Prompt
            when={this.props.dirty}
            message="You have haven't saved your new trip yet. If you leave, it will be lost."
          />

          {/* Do not show trip status when saving trip for the first time
              (it doesn't exist in backend yet). */}
          {!isCreating && <TripStatus monitoredTrip={monitoredTrip} />}
          <ControlLabel>Selected itinerary:</ControlLabel>
          <TripSummary monitoredTrip={monitoredTrip} />

          <FormGroup validationState={errorStates.tripName}>
            <ControlLabel>Please provide a name for this trip:</ControlLabel>
            {/* onBlur, onChange, and value are passed automatically. */}
            <Field as={FormControl} name='tripName' />
            <FormControl.Feedback />
            {errors.tripName && <HelpBlock>{errors.tripName}</HelpBlock>}
          </FormGroup>

          <FormGroup validationState={monitoredDaysValidationState}>
            <ControlLabel>What days do you take this trip?</ControlLabel>
            <div>
              {allDays.map(({ name, fullText, text }, index) => {
                const isDayDisabled = itineraryExistence && !itineraryExistence[name].valid
                const boxClass = isDayDisabled ? 'alert-danger' : (monitoredTrip[name] ? 'bg-primary' : '')
                const notAvailableText = isDayDisabled ? `Trip not available on ${fullText}` : null

                return (
                  <TripDayLabel className={boxClass} key={index} title={notAvailableText}>
                    <span>{text}</span>
                    { // Let users save an existing trip, even though it may not be available on some days.
                      // TODO: improve checking trip availability.
                      isDayDisabled && isCreating
                        ? <Glyphicon aria-label={notAvailableText} glyph='ban-circle' />
                        : <Field name={name} type='checkbox' />
                    }
                  </TripDayLabel>
                )
              })}
              <div style={{clear: 'both'}} />
            </div>
            <HelpBlock>
              {itineraryExistence
                ? (
                  <>Your trip is available on the days of the week as indicated above.</>
                ) : (
                  <ProgressBar active label='Checking itinerary existence for each day of the week...' now={100} />
                )
              }
            </HelpBlock>
            {monitoredDaysValidationState && <HelpBlock>Please select at least one day to monitor.</HelpBlock>}

            {/* Scroll to the trip name/days fields if submitting and there is an error on these fields. */}
            <FormikErrorFocus align='middle' duration={200} />
          </FormGroup>
        </div>
      )
    }
  }
}

// Connect to redux store
const mapStateToProps = (state, ownProps) => {
  const { itineraryExistence } = state.user
  return {
    itineraryExistence
  }
}

const mapDispatchToProps = {
  checkItineraryExistence: userActions.checkItineraryExistence,
  clearItineraryExistence: userActions.clearItineraryExistence
}

export default connect(mapStateToProps, mapDispatchToProps)(TripBasicsPane)
