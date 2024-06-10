/* eslint-disable complexity */
/* eslint-disable react/prop-types */
// FIXME: Remove this eslint rule exception.
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Times } from '@styled-icons/fa-solid/Times'
import coreUtils from '@opentripplanner/core-utils'
import memoize from 'lodash.memoize'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactResizeDetector from 'react-resize-detector'

import { compressStreetName } from '../util/compress-street-name'
import { ELEVATION_BLUE, grey, red } from '../util/colors'
import { setElevationPoint, setLegDiagram } from '../../actions/map'
import { StyledIconWrapper } from '../util/styledIcon'

const { getElevationProfile, getTextWidth, legElevationAtDistance } =
  coreUtils.itinerary

// Fixed dimensions for chart
const height = 160
const yAxisPanelWidth = 40 // width of y axis labels
const BASELINE_Y = height - 20
const topElevYPx = 20
const bottomElevYPx = height - 40
const elevHeight = bottomElevYPx - topElevYPx

const METERS_TO_FEET = 3.28084

const GREY_STROKE = grey[400]

class LegDiagram extends Component {
  static propTypes = {
    elevationPoint: PropTypes.number,
    leg: PropTypes.string,
    setElevationPoint: PropTypes.func,
    setLegDiagram: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      useImperialUnits: true,
      xAxisCompression: 0.5
    }
  }

  componentDidUpdate(prevProps) {
    const { leg } = this.props
    if (leg && prevProps.leg && leg.startTime !== prevProps.leg.startTime) {
      this._determineCompressionFactor(this.state.width, leg)
    }
  }

  _determineCompressionFactor = (width, leg) => {
    const { traversed } = this._getElevationProfile(leg)
    if (traversed > 0) {
      // Determine the appropriate compression factor to scale the elevation
      // chart to fit the container width (i.e., remove the need for x-scrolling).
      const xAxisCompression = width / (traversed + yAxisPanelWidth)
      this.setState({ width, xAxisCompression })
    }
  }

  _onResize = (width, height) => {
    this._determineCompressionFactor(width, this.props.leg)
  }

  /** Set mouse hover location for drawing elevation point. */
  _onMouseMove = (evt) => {
    const m =
      evt.clientX -
      this.container.getBoundingClientRect().left +
      this.container.scrollLeft
    this.props.setElevationPoint(m / this.state.xAxisCompression)
  }

  _onMouseLeave = () => {
    this.props.setElevationPoint(null)
  }

  _onCloseButtonClick = () => {
    this.props.setLegDiagram(null)
    this.props.setElevationPoint(null)
  }

  _unitConversion = () => (this.state.useImperialUnits ? METERS_TO_FEET : 1)

  /** Round elevation to whole number and add symbol. */
  _formatElevation(elev) {
    return Math.round(elev) + (this.state.useImperialUnits ? "'" : 'm')
  }

  _getElevationProfile = memoize((leg) => {
    if (!leg) return {}
    return getElevationProfile(leg.steps, this._unitConversion())
  })

  render() {
    const { elevationPoint } = this.props
    const { xAxisCompression } = this.state

    const { leg } = this.props
    if (!leg) return null

    const yAxisPanelSvgContent = []

    const backgroundSvgContent = []
    const mainSvgContent = []
    const foregroundSvgContent = []

    const { maxElev, minElev, points, traversed } =
      this._getElevationProfile(leg)

    const SVG_WIDTH = traversed * xAxisCompression
    const range = maxElev - minElev
    let rangeUnit
    if (range > 4000) {
      rangeUnit = 1000
    } else if (range > 2000) {
      rangeUnit = 500
    } else if (range > 800) {
      rangeUnit = 250
    } else if (range > 400) {
      rangeUnit = 100
    } else {
      rangeUnit = 50
    }

    // Compute the displayed elevation range
    const minDisplayed = Math.floor(minElev / rangeUnit) * rangeUnit
    const maxDisplayed = Math.ceil(maxElev / rangeUnit) * rangeUnit
    const displayedRange = maxDisplayed - minDisplayed

    // Draw the y-axis labels & guidelines
    for (let elev = minDisplayed; elev <= maxDisplayed; elev += rangeUnit) {
      const y =
        topElevYPx +
        elevHeight -
        (elevHeight * (elev - minDisplayed)) / displayedRange
      yAxisPanelSvgContent.push(
        <text
          fontSize={11}
          key={`axis-label-${elev}`}
          textAnchor="end"
          x={yAxisPanelWidth - 3}
          y={y + 3}
        >
          {this._formatElevation(elev)}
        </text>
      )
      backgroundSvgContent.push(
        <line
          key={`axis-guideline-${elev}`}
          stroke={GREY_STROKE}
          strokeDasharray="1, 3"
          strokeWidth={1}
          x1={0}
          x2={SVG_WIDTH}
          y1={y}
          y2={y}
        />
      )
    }
    let currentX = 0
    const ptArr = []
    const stepArr = [currentX]
    const stepDetails = []
    let previousPair
    leg.steps.map((step, stepIndex) => {
      const stepWidthPx = step.distance * xAxisCompression
      let gain = 0
      let loss = 0
      // Add this step to the polyline coords
      if (step.elevation && step.elevation.length > 0) {
        for (let i = 0; i < step.elevation.length; i++) {
          const elevPair = step.elevation[i]
          if (previousPair) {
            const diff =
              (elevPair.second - previousPair.second) * this._unitConversion()
            if (diff > 0) gain += diff
            else loss += diff
          }
          const x = currentX + elevPair.first * xAxisCompression // - firstX
          const y =
            topElevYPx +
            elevHeight -
            (elevHeight *
              (elevPair.second * this._unitConversion() - minDisplayed)) /
              displayedRange
          ptArr.push([x, y])
          previousPair = elevPair
        }
      }

      // Add the street segment as a horizontal line at the bottom of the diagram
      mainSvgContent.push(
        <line
          key={`step-${stepIndex}-line`}
          stroke={GREY_STROKE}
          strokeWidth={4}
          x1={currentX + 1}
          x2={currentX + stepWidthPx - 1}
          y1={BASELINE_Y}
          y2={BASELINE_Y}
        />
      )
      // Add The street name label, including clipping path to prevent overflow
      if (stepWidthPx > 30) {
        mainSvgContent.push(
          <g key={`step-${stepIndex}-label`}>
            <clipPath id={`clip-${stepIndex}`}>
              <rect
                height={200}
                width={stepWidthPx - 10}
                x={currentX + 10}
                y={0}
              />
            </clipPath>
            <text
              fontSize={16}
              textAnchor="middle"
              x={currentX + stepWidthPx / 2}
              y={BASELINE_Y + 18}
            >
              {
                // FIXME: bug where gain is shown for a single step even though
                // the elevation gain actually begins accumulating with a different step
              }
              {gain >= 10 && (
                <tspan fill={red[700]}>
                  ↑{this._formatElevation(gain)}
                  {'  '}
                </tspan>
              )}
              {loss <= -10 && (
                <tspan fill={ELEVATION_BLUE}>
                  ↓{this._formatElevation(-loss)}
                </tspan>
              )}
            </text>
            <clipPath id={`clip-${stepIndex}`}>
              <rect
                height={200}
                width={stepWidthPx - 10}
                x={currentX + 10}
                y={0}
              />
            </clipPath>
          </g>
        )
      }
      currentX += stepWidthPx
      stepArr.push(currentX)
      stepDetails.push({ gain, loss })
    })
    if (ptArr.length === 0) {
      console.warn('There is no elevation data to render for leg', leg)
      return null
    }
    // Add initial point if the first elevation entry does not start at zero
    // distance.
    if (ptArr[0][0] !== 0) ptArr.unshift([0, ptArr[0][1]])
    // Add final points in order to round out area field.
    ptArr.push([SVG_WIDTH, ptArr[ptArr.length - 1][1]])
    ptArr.push([ptArr[ptArr.length - 1][0], BASELINE_Y])
    ptArr.push([0, BASELINE_Y])
    // Construct and add the main elevation contour area
    const pts = ptArr
      .map((pt, i) => (i === 0 ? `M${pt[0]} ${pt[1]}` : `L${pt[0]} ${pt[1]}`))
      .join(' ')
    mainSvgContent.unshift(
      <path
        d={`${pts} Z`}
        fill={ELEVATION_BLUE}
        fillOpacity={0.5}
        key="elev-polyline"
        strokeWidth={0}
      />
    )

    // Add the highlighted elevation point (on mouse hover), if actively hovering.
    if (elevationPoint) {
      const elev = legElevationAtDistance(points, elevationPoint)
      const elevConverted = elev * this._unitConversion()
      const x = elevationPoint * xAxisCompression
      for (let i = 0; i < stepArr.length; i++) {
        if (x >= stepArr[i] && x <= stepArr[i + 1]) {
          const beginStep = stepArr[i]
          // Mouse hover is at step i, add hover fill for street step and draw
          // street label
          const stepWidth = stepArr[i + 1] - beginStep
          backgroundSvgContent.push(
            <rect
              fill={grey[50]}
              fillOpacity={0.5}
              height={200}
              key={`step-hover-${i}`}
              width={stepWidth}
              x={beginStep}
              y={0}
            />
          )
          const name = compressStreetName(leg.steps[i].streetName)
          const fontSize = 22
          const midPoint = beginStep + stepWidth / 2
          // Determine where to anchor hover street label text (to avoid
          // clipping on edges of svg).
          let anchor = 'middle'
          let x = midPoint
          const halfLabelWidth = getTextWidth(name) / 2
          if (midPoint - halfLabelWidth < 0) {
            // Anchor left edge of text to left of svg
            anchor = 'start'
            x = 0 + 3
          } else if (midPoint + halfLabelWidth > SVG_WIDTH) {
            // Anchor right edge of text to right of svg
            anchor = 'end'
            x = SVG_WIDTH - 3
          }
          backgroundSvgContent.push(
            <text
              fill={grey[600]}
              fontSize={fontSize}
              key={`step-text-hover-${i}`}
              opacity={0.6}
              textAnchor={anchor}
              x={x}
              y={height / 2}
            >
              {name}
            </text>
          )
        }
      }
      const y =
        elev !== null
          ? topElevYPx +
            elevHeight -
            (elevHeight * (elevConverted - minDisplayed)) / displayedRange
          : height / 2
      backgroundSvgContent.push(
        <line
          key="elev-point-line"
          stroke={GREY_STROKE}
          strokeWidth={1}
          x1={x}
          x2={x}
          y1={elev !== null ? y : topElevYPx}
          y2={BASELINE_Y}
        />
      )
      // Only add the current elevation indicator and label if there is a data
      // point available.
      if (elev !== null) {
        foregroundSvgContent.push(
          <circle
            cx={x}
            cy={y}
            fill={ELEVATION_BLUE}
            key="elev-point-circle"
            r="8"
            stroke="white"
            strokeWidth="2"
          />
        )
        // Add the current elevation text label
        foregroundSvgContent.push(
          <text
            fontSize={14}
            fontWeight={600}
            key="elev-point-label"
            textAnchor="middle"
            x={x}
            y={y - 15}
          >
            {this._formatElevation(elevConverted)}
          </text>
        )
      }
    }
    return (
      <div className="leg-diagram">
        {/* The y-axis labels, which are fixed to the left side */}
        <div className="y-axis-panel" style={{ width: yAxisPanelWidth }}>
          <svg>{yAxisPanelSvgContent}</svg>
        </div>

        {/* The main, scrollable diagram */}
        <div
          className="main-diagram"
          onMouseLeave={this._onMouseLeave}
          onMouseMove={this._onMouseMove}
          ref={(container) => {
            this.container = container
          }}
          style={{ left: 40 }}
        >
          <svg height={height} width={SVG_WIDTH + 10}>
            {backgroundSvgContent}
            {mainSvgContent}
            {foregroundSvgContent}
          </svg>
          <ReactResizeDetector handleWidth onResize={this._onResize} />
        </div>

        {/* The close button */}
        <Button
          className="close-button clear-button-formatting"
          onClick={this._onCloseButtonClick}
        >
          <StyledIconWrapper>
            <Times />
          </StyledIconWrapper>
        </Button>
      </div>
    )
  }
}

// Connect to Redux store

const mapStateToProps = (state, ownProps) => {
  return {
    elevationPoint: state.otp.ui.elevationPoint
  }
}

const mapDispatchToProps = {
  setElevationPoint,
  setLegDiagram
}

export default connect(mapStateToProps, mapDispatchToProps)(LegDiagram)
