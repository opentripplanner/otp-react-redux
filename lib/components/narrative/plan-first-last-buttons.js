import React from 'react'
import {Button} from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import {connect} from 'react-redux'

import * as planActions from '../../actions/plan'
import {getActiveItineraries} from '../../util/state'

import {FlexButtonGroup} from './styled'

function PlanFirstLastButtons (props) {
  const {enabled, itineraries, planFirst, planLast, planNext, planPrevious} = props
  if (!enabled || itineraries.length === 0) {
    return null
  }
  return (
    <FlexButtonGroup>
      <Button bsSize='small' onClick={planFirst}>
        <FormattedMessage id='components.PlanFirstLastButtons.first' />
      </Button>
      <Button bsSize='small' onClick={planPrevious}>
        <FormattedMessage id='components.PlanFirstLastButtons.previous' />
      </Button>
      <Button bsSize='small' onClick={planNext}>
        <FormattedMessage id='components.PlanFirstLastButtons.next' />
      </Button>
      <Button bsSize='small' onClick={planLast}>
        <FormattedMessage id='components.PlanFirstLastButtons.last' />
      </Button>
    </FlexButtonGroup>
  )
}

const mapStateToProps = (state, ownProps) => {
  const itineraries = getActiveItineraries(state)
  return {
    enabled: state.otp.config.itinerary?.showPlanFirstLastButtons,
    itineraries
  }
}

const mapDispatchToProps = {
  planFirst: planActions.planFirst,
  planLast: planActions.planLast,
  planNext: planActions.planNext,
  planPrevious: planActions.planPrevious
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanFirstLastButtons)
