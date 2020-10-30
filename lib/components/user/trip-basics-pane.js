import { Field } from 'formik'
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
import styled from 'styled-components'

import * as userActions from '../../actions/user'
import { ALL_DAYS } from '../../util/monitored-trip'
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
 * @returns true if there is a trip matching for the specified availability/existence check.
 */
function isDayAvailable (dayAvailability) {
  return dayAvailability && dayAvailability.isValid
}

/**
 * This component shows summary information for a trip
 * and lets the user edit the trip name and day.
 */
class TripBasicsPane extends Component {
  componentDidMount () {
    // Check itinerary availability (existence) for all days.
    const { checkItineraryAvailability, values: monitoredTrip } = this.props
    checkItineraryAvailability(monitoredTrip)
  }

  componentDidUpdate (prevProps) {
    const { isCreating, itineraryAvailability, setFieldValue } = this.props

    if (itineraryAvailability !== prevProps.itineraryAvailability) {
      // For new trips only,
      // update the Formik state to uncheck days for which the itinerary is not available.
      if (isCreating && itineraryAvailability) {
        ALL_DAYS.forEach(day => {
          if (!isDayAvailable(itineraryAvailability[day])) {
            setFieldValue(day, false)
          }
        })
      }
    }
  }

  componentWillUnmount () {
    this.props.clearItineraryAvailability()
  }

  render () {
    const { errors, isCreating, itineraryAvailability, touched, values: monitoredTrip } = this.props
    const { itinerary } = monitoredTrip

    if (!itinerary) {
      return <div>No itinerary to display.</div>
    } else {
      // Show an error indicaton when monitoredTrip.tripName is not blank (from the form's validation schema)
      // and that tripName is not already used.
      let tripNameValidationState = null
      if (touched.tripName) {
        tripNameValidationState = errors.tripName ? 'error' : null
      }

      // Show a combined error indicaton when no day is selected.
      let monitoredDaysValidationState = null
      ALL_DAYS.forEach(day => {
        if (touched[day]) {
          if (!monitoredDaysValidationState) {
            monitoredDaysValidationState = errors[day] ? 'error' : null
          }
        }
      })

      return (
        <div>
          <ControlLabel>Selected itinerary:</ControlLabel>
          <TripSummary monitoredTrip={monitoredTrip} />

          <FormGroup validationState={tripNameValidationState}>
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
                const isDayDisabled = itineraryAvailability && !isDayAvailable(itineraryAvailability[name])
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
              {itineraryAvailability
                ? (
                  <>Your trip is available on the days of the week as indicated above.</>
                ) : (
                  <ProgressBar active label='Checking itinerary existence for each day of the week...' now={100} />
                )
              }
            </HelpBlock>
            {monitoredDaysValidationState && <HelpBlock>Please select at least one day to monitor.</HelpBlock>}
          </FormGroup>
        </div>
      )
    }
  }
}

// Connect to redux store
const mapStateToProps = (state, ownProps) => {
  const { accessToken, itineraryAvailability } = state.user
  return {
    accessToken,
    config: state.otp.config,
    itineraryAvailability
  }
}

const mapDispatchToProps = {
  checkItineraryAvailability: userActions.checkItineraryAvailability,
  clearItineraryAvailability: userActions.clearItineraryAvailability
}

export default connect(mapStateToProps, mapDispatchToProps)(TripBasicsPane)
