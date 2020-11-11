import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'

import LinkButton from '../user/link-button'
import { itineraryCanBeMonitored } from '../../util/itinerary'
import { getActiveItinerary } from '../../util/state'

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

  if (buttonDisabled) {
    const tooltip = <Tooltip id='disabled-save-tooltip'>{tooltipText}</Tooltip>

    return (
      // Apply disabled bootstrap button styles to a non-input element
      // to keep Tooltip and OverlayTrigger functional.
      // Also apply pull-right style class so that the element is flush right, even with LineItineraries.
      <OverlayTrigger placement='top' overlay={tooltip}>
        <span className='btn disabled clear-button-formatting pull-right'>
          <i className={icon} /> {buttonText}
        </span>
      </OverlayTrigger>
    )
  }

  return (
    <LinkButton
      // Also apply pull-right style class so that the element is flush right, even with LineItineraries.
      className='clear-button-formatting pull-right'
      to='/savetrip'
    >
      <i className={icon} /> {buttonText}
    </LinkButton>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { persistence } = state.otp.config
  return {
    itinerary: getActiveItinerary(state.otp),
    loggedInUser: state.user.loggedInUser,
    persistence
  }
}

export default connect(mapStateToProps)(SaveTripButton)
