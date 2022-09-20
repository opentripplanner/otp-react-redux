// TODO: Typescript
/* eslint-disable react/prop-types */
import { Ban } from '@styled-icons/fa-solid/Ban'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Lock } from '@styled-icons/fa-solid/Lock'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { PlusCircle } from '@styled-icons/fa-solid/PlusCircle'
import React from 'react'

import { CREATE_TRIP_PATH } from '../../util/constants'
import { getActiveItinerary } from '../../util/state'
import { itineraryCanBeMonitored } from '../../util/itinerary'
import { LinkContainerWithQuery } from '../form/connected-links'
import StyledIconWrapper from '../util/styledIcon'

/**
 * This connected component encapsulates the states and behavior of the button
 * to save an itinerary for notifications.
 */
const SaveTripButton = ({ itinerary, loggedInUser, persistence }) => {
  const intl = useIntl()
  // We are dealing with the following states:
  // 1. Persistence disabled => just return null
  // 2. User is not logged in => render something like: "Please sign in to save trip".
  // 3. itin cannot be monitored => disable the button with prompt and tooltip.

  let buttonDisabled
  let buttonText
  let tooltipText
  let iconType
  let ButtonIcon

  if (!persistence || !persistence.enabled) {
    return null
  } else if (!loggedInUser) {
    buttonDisabled = true
    buttonText = <FormattedMessage id="components.SaveTripButton.signInText" />
    iconType = 'lock'
    ButtonIcon = Lock
    tooltipText = intl.formatMessage({
      id: 'components.SaveTripButton.signInTooltip'
    })
  } else if (!itineraryCanBeMonitored(itinerary)) {
    buttonDisabled = true
    buttonText = (
      <FormattedMessage id="components.SaveTripButton.cantSaveText" />
    )
    iconType = 'ban'
    ButtonIcon = Ban
    tooltipText = intl.formatMessage({
      id: 'components.SaveTripButton.cantSaveTooltip'
    })
  } else {
    buttonText = (
      <FormattedMessage id="components.SaveTripButton.saveTripText" />
    )
    iconType = 'plus-circle'
    ButtonIcon = PlusCircle
  }
  const button = (
    <button
      // Apply pull-right style class so that the element is flush right,
      // even with LineItineraries.
      className="clear-button-formatting pull-right"
      disabled={buttonDisabled}
      style={buttonDisabled ? { pointerEvents: 'none' } : {}}
    >
      <StyledIconWrapper spaceAfter>
        <ButtonIcon />
      </StyledIconWrapper>
      {buttonText}
    </button>
  )
  // Show tooltip with help text if button is disabled.
  if (buttonDisabled) {
    return (
      <OverlayTrigger
        overlay={
          <Tooltip id="disabled-save-tooltip">
            {/* Must get text using intl.formatMessage here because the rendering
             of OverlayTrigger seems to occur outside of the IntlProvider context. */}
            {tooltipText}
          </Tooltip>
        }
        placement="top"
      >
        {/* An active element around the disabled button is necessary
            for the OverlayTrigger to render. */}
        <div className="pull-right" style={{ cursor: 'not-allowed' }}>
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
    itinerary: getActiveItinerary(state),
    loggedInUser: state.user.loggedInUser,
    persistence
  }
}

export default connect(mapStateToProps)(SaveTripButton)
