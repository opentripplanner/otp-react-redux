import React from 'react'
import { connect } from 'react-redux'

import LinkButton from '../user/link-button'
import { itineraryCanBeMonitored } from '../../util/itinerary'
import {
  getActiveItineraries,
  getActiveSearch
} from '../../util/state'

/**
 * This connected component encapsulates the states and behavior of the button
 * to save an itinerary for notifications.
 */
const SaveTripButton = ({
  itinerary,
  loggedInUser,
  persistence
}) => {
  // We are dealing with the following states:
  // 1. Persistence disabled => just return null
  // 2. User is not logged in => render something like: "Please sign in to save trip".
  // 3. itin cannot be monitored => disable the button with prompt and tooltip.

  let buttonDisabled
  let buttonText
  let tooltipText
  let icon

  if (!persistence || !persistence.enabled) {
    return null
  } else if (!loggedInUser) {
    buttonDisabled = true
    buttonText = 'Sign in to save trip'
    icon = 'fa fa-lock'
    tooltipText = 'Please sign in to save trip.'
  } else if (!itineraryCanBeMonitored(itinerary)) {
    buttonDisabled = true
    buttonText = 'Cannot save'
    icon = 'fa fa-ban'
    tooltipText = 'Only itineraries that include transit and no rentals or ride hailing can be monitored.'
  } else {
    buttonText = 'Save trip'
    icon = 'fa fa-plus-circle'
  }

  return (
    <LinkButton
      componentClass='button'
      className='clear-button-formatting'
      disabled={buttonDisabled}
      title={tooltipText}
      to='/savetrip'
    >
      <i className={icon} /> {buttonText}
    </LinkButton>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const { persistence } = state.otp.config
  const itineraries = getActiveItineraries(state.otp)
  return {
    itinerary: activeSearch && itineraries && itineraries[activeSearch.activeItinerary],
    loggedInUser: state.user.loggedInUser,
    persistence
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {}

export default connect(mapStateToProps, mapDispatchToProps)(SaveTripButton)
