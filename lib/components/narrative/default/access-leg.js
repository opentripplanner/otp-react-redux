import coreUtils from '@opentripplanner/core-utils'
import { humanizeDistanceString } from '@opentripplanner/humanize-distance'
import PropTypes from 'prop-types'
import React, {Component} from 'react'

import Icon from '../icon'
import LegDiagramPreview from '../leg-diagram-preview'

/**
 * Default access leg component for narrative itinerary.
 */
export default class AccessLeg extends Component {
  static propTypes = {
    activeStep: PropTypes.number,
    leg: PropTypes.object,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  _onLegClick = (e) => {
    const {active, leg, index, setActiveLeg} = this.props
    if (active) {
      setActiveLeg(null)
    } else {
      setActiveLeg(index, leg)
    }
  }

  _onStepClick (e, step, index) {
    if (index === this.props.activeStep) {
      this.props.setActiveStep(null)
    } else {
      this.props.setActiveStep(index, step)
    }
  }

  render () {
    const { active, activeStep, index, leg } = this.props
    return (
      <div
        key={index}
        className={`leg${active ? ' active' : ''} access-leg`}>
        <button
          className='header'
          onClick={this._onLegClick}>
          <span><Icon type={`caret-${active ? 'down' : 'right'}`} /></span>
          <span><b>{leg.mode}</b></span>
          {' '}
          <span className='leg-duration'>{coreUtils.time.formatDuration(leg.duration)}</span>
          {' '}
          <span className='leg-distance'>({humanizeDistanceString(leg.distance)})</span>
        </button>
        {active &&
          <div className='step-by-step'>
            <div className='access-leg'>
              {leg.steps.map((step, stepIndex) => {
                const stepIsActive = activeStep === stepIndex
                return (
                  <button
                    key={stepIndex}
                    className={`step ${stepIsActive ? 'active' : ''}`}
                    onClick={(e) => this._onStepClick(e, step, stepIndex)}>
                    <span className='step-distance'>{humanizeDistanceString(step.distance)}</span>
                    <span className='step-text'>{coreUtils.itinerary.getStepInstructions(step)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        }
        <LegDiagramPreview leg={leg} />
      </div>
    )
  }
}
