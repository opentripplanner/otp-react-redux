import { Ban } from '@styled-icons/fa-solid/Ban'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Lock } from '@styled-icons/fa-solid/Lock'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { PlusCircle } from '@styled-icons/fa-solid/PlusCircle'
import React from 'react'

import { AppReduxState } from '../../util/state-types'
import { CREATE_TRIP_PATH } from '../../util/constants'
import { getActiveItinerary } from '../../util/state'
import { IconWithText } from '../util/styledIcon'
import {
  itineraryCanBeMonitored,
  ItineraryWithOtp1HailedCar
} from '../../util/itinerary'
import { PersistenceConfig } from '../../util/config-types'
import { UnstyledLink } from '../user/styled'
import { User } from '../user/types'

interface Props {
  itinerary?: ItineraryWithOtp1HailedCar
  loggedInUser?: User
  persistence?: PersistenceConfig
}

/**
 * This connected component encapsulates the states and behavior of the button
 * to save an itinerary for notifications.
 */
const SaveTripButton = ({
  itinerary,
  loggedInUser,
  persistence
}: Props): JSX.Element | null => {
  const intl = useIntl()
  // We are dealing with the following states:
  // 1. Persistence disabled => just return null
  // 2. User is not logged in => render something like: "Please log in to save trip".
  // 3. itin cannot be monitored => disable the button with prompt and tooltip.

  if (!persistence || !persistence.enabled) return null

  let buttonDisabled
  let buttonText
  let tooltipText
  let ButtonIcon

  if (!loggedInUser) {
    buttonDisabled = true
    buttonText = <FormattedMessage id="components.SaveTripButton.signInText" />
    ButtonIcon = Lock
    // Must get text using intl.formatMessage here because the rendering
    // OverlayTrigger occurs outside of the IntlProvider context.
    tooltipText = intl.formatMessage({
      id: 'components.SaveTripButton.signInTooltip'
    })
  } else if (!itineraryCanBeMonitored(itinerary)) {
    buttonDisabled = true
    buttonText = (
      <FormattedMessage id="components.SaveTripButton.cantSaveText" />
    )
    ButtonIcon = Ban
    tooltipText = intl.formatMessage({
      id: 'components.SaveTripButton.cantSaveTooltip'
    })
  }
  // Show tooltip with help text if button is disabled.
  if (buttonDisabled) {
    const button = (
      <button
        // Apply pull-right style class so that the element is flush right,
        // even with LineItineraries.
        className="clear-button-formatting pull-right"
        disabled={buttonDisabled}
        style={{ pointerEvents: 'none' }}
      >
        <IconWithText Icon={ButtonIcon}>{buttonText}</IconWithText>
      </button>
    )
    return (
      <OverlayTrigger
        overlay={<Tooltip id="disabled-save-tooltip">{tooltipText}</Tooltip>}
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
    <UnstyledLink className="pull-right" to={CREATE_TRIP_PATH}>
      <IconWithText Icon={PlusCircle}>
        <FormattedMessage id="components.SaveTripButton.saveTripText" />
      </IconWithText>
    </UnstyledLink>
  )
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const { persistence } = state.otp.config
  return {
    itinerary: getActiveItinerary(state) as ItineraryWithOtp1HailedCar,
    loggedInUser: state.user.loggedInUser,
    persistence
  }
}

export default connect(mapStateToProps)(SaveTripButton)
