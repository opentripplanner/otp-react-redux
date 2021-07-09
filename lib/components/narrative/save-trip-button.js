import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'

import { LinkContainerWithQuery } from '../form/connected-links'
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
  persistence
}) => {
  const intl = useIntl()
  // We are dealing with the following states:
  // 1. Persistence disabled => just return null
  // 2. User is not logged in => render something like: "Please sign in to save trip".
  // 3. itin cannot be monitored => disable the button with prompt and tooltip.

  let buttonDisabled
  let buttonTextId
  let tooltipTextId
  let icon

  if (!persistence || !persistence.enabled) {
    return null
  } else if (!loggedInUser) {
    buttonDisabled = true
    buttonTextId = 'components.SaveTripButton.signInText'
    icon = 'fa fa-lock'
    tooltipTextId = 'components.SaveTripButton.signInTooltip'
  } else if (!itineraryCanBeMonitored(itinerary)) {
    buttonDisabled = true
    buttonTextId = 'components.SaveTripButton.cantSaveText'
    icon = 'fa fa-ban'
    tooltipTextId = 'components.SaveTripButton.cantSaveTooltip'
  } else {
    buttonTextId = 'components.SaveTripButton.saveTripText'
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
      <i className={icon} />
      {' '}
      <FormattedMessage id={buttonTextId} />
    </button>
  )
  // Show tooltip with help text if button is disabled.
  if (buttonDisabled) {
    return (
      <OverlayTrigger
        overlay={(
          <Tooltip id='disabled-save-tooltip'>
            {intl.formatMessage({id: tooltipTextId})}
          </Tooltip>
        )}
        placement='top'
      >
        <div style={{ cursor: 'not-allowed' }}>
          {button}
        </div>
      </OverlayTrigger>
    )
  }

  return (
    <LinkContainerWithQuery to={CREATE_TRIP_PATH}>
      {button}
    </LinkContainerWithQuery>
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
