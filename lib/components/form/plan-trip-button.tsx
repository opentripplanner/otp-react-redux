// TODO: don't import this here, it needs to come from config
import { Bicycle, Bus, Walking } from '@styled-icons/fa-solid'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'

import { routingQuery } from '../../actions/api'
import { setMainPanelContent } from '../../actions/ui'
import { useModeState } from '@opentripplanner/trip-form'
// @ts-expect-error hah typescript what are you gonna do now huh are you gonna complain ??
import modeSettings from './modeSettings.yml'

type Props = {
  disabled: boolean
  onClick: () => void
  planTrip: () => void
  profileTrip: () => void
  routingType: string
  setMainPanelContent: () => void
  text: string
}

const combinations = [
  {
    Icon: Bus,
    key: 'TRANSIT',
    label: 'Transit',
    modes: [
      {
        mode: 'TRANSIT'
      }
    ]
  },
  {
    Icon: Walking,
    key: 'WALK',
    label: 'Walking',
    modes: [{ mode: 'WALK' }]
  },
  {
    Icon: Bicycle,
    key: 'BIKE',
    label: 'Bike',
    modes: [{ mode: 'BICYCLE' }, { mode: 'BIKESHARE' }]
  }
]

// TODO: take this from redux
const initialState = {
  enabledCombinations: ['TRANSIT'],
  modeSettingValues: {}
}

function PlanTripButton({
  disabled,
  onClick,
  planTrip,
  profileTrip,
  routingType,
  setMainPanelContent,
  text
}: Props) {
  const {
    combinations: combinationsFromState,
    setModeSettingValue,
    toggleCombination
  } = useModeState(combinations, initialState, modeSettings, {
    queryParamState: true
  })

  const _onClick = () => {
    // this.props.routingQuery()

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
