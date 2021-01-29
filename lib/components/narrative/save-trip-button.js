import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'

import { CREATE_TRIP_PATH } from '../../util/constants'
import { itineraryCanBeMonitored } from '../../util/itinerary'
import { getActiveItinerary } from '../../util/state'

/**
 * This connected component encapsulates the states and behavior of the button
 * to save an itinerary for notifications.
 */
const SaveTripButton = ({
  itinerary,
  loggedInUser,
  persistence,
  queryParams
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
  const button = (
    <button
      // Apply pull-right style class so that the element is flush right,
      // even with LineItineraries.
      className='clear-button-formatting pull-right'
      disabled={buttonDisabled}
      style={buttonDisabled ? { pointerEvents: 'none' } : {}}
    >
      <i className={icon} /> {buttonText}
    </button>
  )
  // Show tooltip with help text if button is disabled.
  if (buttonDisabled) {
    return (
      <OverlayTrigger
        overlay={<Tooltip id='disabled-save-tooltip'>{tooltipText}</Tooltip>}
        placement='top'
      >
        <div style={{ cursor: 'not-allowed' }}>
          {button}
        </div>
      </OverlayTrigger>
    )
  }

  return (
    <LinkContainer to={{ pathname: CREATE_TRIP_PATH, search: queryParams }}>
      {button}
    </LinkContainer>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { persistence } = state.otp.config
  return {
    itinerary: getActiveItinerary(state.otp),
    loggedInUser: state.user.loggedInUser,
    persistence,
    queryParams: state.router.location.search
  }
}

export default connect(mapStateToProps)(SaveTripButton)
