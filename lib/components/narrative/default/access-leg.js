import { FormattedMessage } from 'react-intl'
import { humanizeDistanceString } from '@opentripplanner/humanize-distance'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import FormattedDuration from '../../util/formatted-duration'
import FormattedMode from '../../util/formatted-mode'
import Icon from '../../util/icon'
import LegDiagramPreview from '../leg-diagram-preview'
import Strong from '../../util/strong-text'

/**
 * Default access leg component for narrative itinerary.
 */
export default class AccessLeg extends Component {
  static propTypes = {
    active: PropTypes.bool,
    activeStep: PropTypes.number,
    index: PropTypes.number,
    leg: PropTypes.object,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  _onLegClick = (e) => {
    const { active, index, leg, setActiveLeg } = this.props
    if (active) {
      setActiveLeg(null)
    } else {
      setActiveLeg(index, leg)
    }
  }

  _onStepClick(e, step, index) {
    if (index === this.props.activeStep) {
      this.props.setActiveStep(null)
    } else {
      this.props.setActiveStep(index, step)
    }
  }

  render() {
    const { active, activeStep, index, leg } = this.props
    return (
      <div className={`leg${active ? ' active' : ''} access-leg`} key={index}>
        <button className="header" onClick={this._onLegClick}>
          <span>
            <Icon type={`caret-${active ? 'down' : 'right'}`} />
          </span>
          <FormattedMessage
            id="components.AccessLeg.summary"
            values={{
              distance: humanizeDistanceString(leg.distance),
              distanceSpan: (contents) => (
                <span className="leg-distance">{contents}</span>
              ),
              durationSpan: (contents) => (
                <span className="leg-duration">{contents}</span>
              ),
              formattedDuration: <FormattedDuration duration={leg.duration} />,
              mode: <FormattedMode mode={leg.mode.toLowerCase()} />,
              strong: Strong
            }}
          />
        </button>
        {active && (
          <div className="step-by-step">
            <div className="access-leg">
              {leg.steps.map((step, stepIndex) => {
                const stepIsActive = activeStep === stepIndex
                return (
                  <button
                    className={`step ${stepIsActive ? 'active' : ''}`}
                    key={stepIndex}
                    onClick={(e) => this._onStepClick(e, step, stepIndex)}
                  >
                    <span className="step-distance">
                      {humanizeDistanceString(step.distance)}
                    </span>
                    <span className="step-text">
                      {/** TODO: remove use of deprecated unlocalized method once itinerary-body is localized */}
                      {coreUtils.itinerary.getStepInstructions(step)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <LegDiagramPreview leg={leg} />
      </div>
    )
  }
}
