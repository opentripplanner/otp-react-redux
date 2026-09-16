import { Button } from 'react-bootstrap'
import { Check, FileText } from '@styled-icons/fa-solid'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import { textOnlyItineraryString } from '@opentripplanner/itinerary-body'
import copyToClipboard from 'copy-to-clipboard'
import React, { useState } from 'react'

import { AppConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { getActiveItinerary } from '../../util/state'
import { IconWithText } from '../util/styledIcon'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

function CopyItineraryTextButton({
  config,
  itinerary
}: {
  config: AppConfig
  itinerary: Itinerary
}) {
  const [showCopied, setShowCopied] = useState(false)

  const onClick = (text: string) => {
    setShowCopied(true)
    copyToClipboard(text)
    window.setTimeout(() => setShowCopied(false), 2000)
  }

  const textOnlyItinerary = textOnlyItineraryString(itinerary, config)

  return (
    <div>
      <InvisibleA11yLabel aria-live="assertive">
        {showCopied && (
          <FormattedMessage id="components.TripTools.linkCopied" />
        )}
      </InvisibleA11yLabel>
      <Button
        className="tool-button"
        onClick={() => onClick(textOnlyItinerary)}
      >
        {showCopied ? (
          <span>
            <IconWithText Icon={Check}>
              <FormattedMessage id="components.TripTools.linkCopied" />
            </IconWithText>
          </span>
        ) : (
          <span>
            <IconWithText Icon={FileText}>
              <FormattedMessage id="components.TripTools.copyItineraryText" />
            </IconWithText>
          </span>
        )}
      </Button>
    </div>
  )
}

// connect to the redux store
const mapStateToProps = (state: AppReduxState) => {
  const itinerary = getActiveItinerary(state) as Itinerary
  const { config } = state.otp
  return {
    config,
    itinerary
  }
}

export default connect(mapStateToProps)(CopyItineraryTextButton)
