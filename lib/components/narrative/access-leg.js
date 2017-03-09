import Icon from './icon'
import React, {PropTypes, Component} from 'react'

import { distanceString } from '../../util/distance'
import { getStepInstructions } from '../../util/itinerary'
import { formatDuration } from '../../util/time'

export default class AccessLeg extends Component {
  static propTypes = {
    activeStep: PropTypes.number,
    leg: PropTypes.object,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  _onLegClick (e, leg, index) {
    if (this.props.active) {
      this.props.setActiveLeg(null)
    } else {
      this.props.setActiveLeg(index, leg)
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
    const legClickHandler = (e) => this._onLegClick(e, leg, index)
    return (
      <div
        key={index}
        className={`leg${active ? ' active' : ''}`}>
        <a
          className='header'
          onClick={legClickHandler}
          tabIndex='0'
          >
          <span><Icon type={`caret-${active ? 'down' : 'right'}`} /></span>
          <span><b>{leg.mode}</b></span>
          {' '}
          <span className='leg-duration'>{formatDuration(leg.duration)}</span>
          {' '}
          <span className='leg-distance'>({distanceString(leg.distance)})</span>
        </a>
        {active &&
          <div className='step-by-step'>
            <div className='access-leg'>
              {leg.steps.map((step, stepIndex) => {
                const stepIsActive = activeStep === stepIndex
                return (
                  <div>
                    <a
                      key={stepIndex}
                      className={`step ${stepIsActive ? 'active' : ''}`}
                      onClick={(e) => this._onStepClick(e, step, stepIndex)}
                      tabIndex='0'
                      >
                      <span className='step-distance'>{distanceString(step.distance)}</span>
                      <span className='step-text'>{getStepInstructions(step)}</span>
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        }
      </div>
    )
  }
}
