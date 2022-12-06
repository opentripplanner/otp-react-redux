// TODO: don't import this here, it needs to come from config
import { Bicycle, Bus, Walking } from '@styled-icons/fa-solid'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { useModeState } from '@opentripplanner/trip-form'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'

import { routingQuery } from '../../actions/api'
import { setMainPanelContent } from '../../actions/ui'

type Props = {
  disabled: boolean
  onClick: () => void
  planTrip: () => void
  profileTrip: () => void
  routingQuery: (searchId?: string, updateSearchInReducer?: boolean) => void
  routingType: string
  setMainPanelContent: () => void
  text: string
}

function PlanTripButton({
  disabled,
  onClick,
  planTrip,
  profileTrip,
  routingQuery,
  routingType,
  setMainPanelContent,
  text
}: Props) {
  const _onClick = () => {
    if (typeof onClick === 'function') onClick()
    if (!coreUtils.ui.isMobile()) setMainPanelContent(null)
  }

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

const mapStateToProps = (state, ownProps) => {
  // TODO: add configuration (combinations)
  return {}
}

const mapDispatchToProps = { routingQuery, setMainPanelContent }

export default connect(mapStateToProps, mapDispatchToProps)(PlanTripButton)
