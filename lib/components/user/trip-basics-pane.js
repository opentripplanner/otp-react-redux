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

import { checkItinerary } from '../../util/middleware'
import { ALL_DAYS } from '../../util/monitored-trip'
import TripSummary from './trip-summary'

// Styles.
const StyledLabel = styled.label`
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
  constructor () {
    super()

    this.state = {}
  }

  async componentDidMount () {
    // Check itinerary existence for all days.
    const { accessToken, config, setFieldValue, values } = this.props

    const itineraryCheckResult = await checkItinerary(
      config.persistence.otp_middleware,
      accessToken,
      values
    )

    this.setState({ itineraryCheckResult })

    // Update the Formik state to uncheck days for which the itinerary is not available.
    // Note: If a trip becomes unavailable after the user initially saves a trip,
    // upon saving, the days the itinerary does not exist will no longer be monitored.
    if (itineraryCheckResult && itineraryCheckResult.status === 'success') {
      ALL_DAYS.forEach(day => {
        if (!itineraryCheckResult.data[day]) {
          setFieldValue(day, false)
        }
      })
    }
  }

  render () {
    const { errors, isCreating, touched, values: monitoredTrip } = this.props
    const { itinerary } = monitoredTrip
    const { itineraryCheckResult } = this.state

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
            <ControlLabel>What days to you take this trip?</ControlLabel>
            <div>
              {allDays.map(({ name, fullText, text }, index) => {
                const isDayDisabled =
                  itineraryCheckResult &&
                  itineraryCheckResult.status === 'success' &&
                  !itineraryCheckResult.data[name]

                const boxClass = isDayDisabled ? 'alert-danger' : (monitoredTrip[name] ? 'bg-primary' : '')
                const notAvailableText = isDayDisabled ? `Trip not available on ${fullText}` : null

                return (
                  <StyledLabel className={boxClass} key={index} title={notAvailableText}>
                    <span>{text}</span>
                    { // Let users save an existing trip, even though it may not be available on some days.
                      // TODO: improve checking trip availability.
                      isDayDisabled && isCreating
                        ? <Glyphicon aria-label={notAvailableText} glyph='ban-circle' />
                        : <Field name={name} type='checkbox' />
                    }
                  </StyledLabel>
                )
              })}
              <div style={{clear: 'both'}} />
            </div>
            <HelpBlock>
              {itineraryCheckResult
                ? (
                  <>Your trip is available on the days of the week indicated above.</>
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
  return {
    config: state.otp.config,
    accessToken: state.user.accessToken
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(TripBasicsPane)
