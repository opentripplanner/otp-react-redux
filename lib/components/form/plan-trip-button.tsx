import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { useCallback } from 'react'

import { routingQuery } from '../../actions/api'
import { setMainPanelContent } from '../../actions/ui'

type Props = {
  disabled?: boolean
  onClick: () => void
  setMainPanelContent: (state: number | null) => void
  text?: string
}

function PlanTripButton({
  disabled,
  onClick,
  setMainPanelContent,
  text
}: Props) {
  const _onClick = useCallback(() => {
    if (typeof onClick === 'function') onClick()
    if (!coreUtils.ui.isMobile()) setMainPanelContent(null)
  }, [onClick, setMainPanelContent])

  const locationMissing = false // TODO: get from query params
  const grayedOut = locationMissing || disabled
  return (
    <Button
      className="plan-trip-button"
      disabled={grayedOut}
      onClick={_onClick}
    >
      {text || <FormattedMessage id="components.PlanTripButton.planTrip" />}
    </Button>
  )
}

const mapDispatchToProps = { setMainPanelContent }

export default connect(null, mapDispatchToProps)(PlanTripButton)
