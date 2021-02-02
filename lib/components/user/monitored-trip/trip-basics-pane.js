import { Field } from 'formik'
import React, { Component, createRef } from 'react'
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

import * as userActions from '../../../actions/user'
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
   * Link to the DOM for the trip name label at the top of the form,
   * so we can scroll to show the trip name and days if the user attempts
   * to submit the form and there is a validation error for these data.
   */
  tripNameLabelRef = createRef()

  /**
   * Scroll to the trip name/days fields if submitting and there is an error on these fields.
   * (inspired by https://gist.github.com/dphrag/4db3b453e02567a0bb52592679554a5b)
   */
  _scrollToTripDataIfInvalid = () => {
    const { isSubmitting, isValidating, errors } = this.props
    const keys = Object.keys(errors)

    if (keys.length > 0 && isSubmitting && !isValidating) {
      const { current } = this.tripNameLabelRef
      if (current) {
        current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

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
    this._scrollToTripDataIfInvalid()
  }

  componentWillUnmount () {
    this.props.clearItineraryExistence()
  }

  render () {
    const { errors, isCreating, itineraryExistence, touched, values: monitoredTrip } = this.props
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
      allDays.forEach(({ name }) => {
        if (touched[name]) {
          if (!monitoredDaysValidationState) {
            monitoredDaysValidationState = errors[name] ? 'error' : null
          }
        }
      })

      return (
        <div>
          {/* Do not show trip status when saving trip for the first time
              (it doesn't exist in backend yet). */}
          {!isCreating && <TripStatus monitoredTrip={monitoredTrip} />}
          <ControlLabel>Selected itinerary:</ControlLabel>
          <TripSummary monitoredTrip={monitoredTrip} />

          <FormGroup validationState={tripNameValidationState}>
            <ControlLabel>
              {/* Put a ref in a native DOM element for access to scroll function. */}
              <span ref={this.tripNameLabelRef}>Please provide a name for this trip:</span>
            </ControlLabel>
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
