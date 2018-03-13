import React, {PropTypes, Component} from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setElevationPoint, showLegDiagram } from '../../actions/map'
import { legElevationAtDistance } from '../../util/itinerary'

const METERS_TO_FEET = 3.28084

class LegDiagram extends Component {

  constructor (props) {
    super(props)
    this.state = {
      useImperialUnits: true,
      xAxisCompression: 0.5
    }
  }

  _onMouseMove = (evt) => {
    const m = evt.clientX - this.container.getBoundingClientRect().left + this.container.scrollLeft
    this.props.setElevationPoint(m / this.state.xAxisCompression)
  }

  _onMouseLeave = () => {
    this.props.setElevationPoint(null)
  }

  _onCloseButtonClick = () => {
    this.props.showLegDiagram(null)
    this.props.setElevationPoint(null)
  }

  _formatElevation (elev) {
    return Math.round(elev * 10) / 10 + (this.state.useImperialUnits ? `'` : 'm')
  }

  render () {
    const { elevationPoint } = this.props
    const { useImperialUnits, xAxisCompression } = this.state
    const unitConversion = useImperialUnits ? METERS_TO_FEET : 1

    const { leg } = this.props
    if (!leg) return null

    const yAxisPanelSvgContent = []

    const backgroundSvgContent = []
    const mainSvgContent = []
    const foregroundSvgContent = []

    // Do an initial iteration through all steps to determine the min/max elevation
    let minElev = 100000
    let maxElev = -100000
    let traversed = 0
    leg.steps.forEach(step => {
      traversed += step.distance
      if (!step.elevation || step.elevation.length === 0) return
      for (let i = 0; i < step.elevation.length; i++) {
        const elev = step.elevation[i].second * unitConversion
        if (elev < minElev) minElev = elev
        if (elev > maxElev) maxElev = elev
      }
    })

    const height = 160
    const yAxisPanelWidth = 40
    const lineY = height - 20
    const topElevYPx = 20
    const bottomElevYPx = height - 40
    const elevHeight = bottomElevYPx - topElevYPx
    const width = traversed * xAxisCompression
    const rangeUnit = useImperialUnits ? 100 : 50

    // Compute the displayed elevation range and draw the y-axis labels & guidelines
    const minDisplayed = Math.floor(minElev / rangeUnit) * rangeUnit
    const maxDisplayed = Math.ceil(maxElev / rangeUnit) * rangeUnit
    const displayedRange = maxDisplayed - minDisplayed

    for (let elev = minDisplayed; elev <= maxDisplayed; elev += rangeUnit) {
      const y = topElevYPx + elevHeight - elevHeight * (elev - minDisplayed) / displayedRange
      yAxisPanelSvgContent.push(
        <text
          key={`axis-label-${elev}`}
          x={yAxisPanelWidth - 3}
          y={y + 3}
          fontSize={11}
          textAnchor='end'
        >
          {this._formatElevation(elev)}
        </text>
      )
      backgroundSvgContent.push(
        <line
          key={`axis-guideline-${elev}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          strokeWidth={1}
          stroke='#ccc'
          strokeDasharray='1, 1'
        />
      )
    }

    // Process each step in this leg
    let currentX = 0
    const ptArr = []
    leg.steps.map((step, stepIndex) => {
      const stepWidthPx = step.distance * xAxisCompression

      // Add this step to the polyline coords
      if (step.elevation && step.elevation.length > 0) {
        for (let i = 0; i < step.elevation.length; i++) {
          const elevPair = step.elevation[i]
          const x = currentX + elevPair.first * xAxisCompression
          const y = topElevYPx + elevHeight - elevHeight * (elevPair.second * unitConversion - minDisplayed) / displayedRange
          ptArr.push([x, y])
        }
      }

      // Add the street segment as a horizontal line at the bottom of the diagram
      mainSvgContent.push(
        <line
          key={`step-${stepIndex}-line`}
          x1={currentX + 1}
          y1={lineY}
          x2={currentX + stepWidthPx - 1}
          y2={lineY}
          strokeWidth={6}
          stroke='#aaa'
        />
      )

      // Add The street name label, including clipping path to prevent overflow
      if (stepWidthPx > 100) {
        mainSvgContent.push(
          <g key={`step-${stepIndex}-label`}>
            <clipPath id={`clip-${stepIndex}`}>
              <rect x={currentX + 10} y={0} width={stepWidthPx - 10} height={200} />
            </clipPath>
            <text
              x={currentX + stepWidthPx / 2}
              y={lineY + 16}
              fontSize={11}
              clipPath={`url(#clip-${stepIndex})`}
              textAnchor='middle'
            >
              {compressStreetName(step.streetName)}
            </text>
          </g>
        )
      }
      currentX += stepWidthPx
    })

    // Construct and add the main elevation contour line
    const pts = ptArr.map(pt => `${pt[0]},${pt[1]}`).join(' ')
    mainSvgContent.push(
      <polyline
        key='elev-polyline'
        points={pts}
        strokeWidth={2}
        stroke='#000'
        fill='none'
      />
    )

    // Add the highlighted elevation point, if active
    if (elevationPoint) {
      const elev = legElevationAtDistance(leg, elevationPoint) * unitConversion
      const x = elevationPoint * xAxisCompression
      const y = topElevYPx + elevHeight - elevHeight * (elev - minDisplayed) / displayedRange
      backgroundSvgContent.push(
        <line
          key='elev-point-line'
          x1={x}
          y1={y}
          x2={x}
          y2={lineY}
          strokeWidth={1}
          stroke='#aaa'
        />
      )
      foregroundSvgContent.push(
        <circle
          key='elev-point-circle'
          cx={x}
          cy={y}
          r='4'
          fill='blue'
          stroke='white'
          strokeWidth='2'
        />
      )

      // Add the current elevation text label
      foregroundSvgContent.push(
        <text key='elev-point-label' x={x} y={y - 10} fontSize={11} textAnchor='middle'>
          {this._formatElevation(elev)}
        </text>
      )
    }

    return (
      <div className='leg-diagram'>
        {/* The y-axis labels, which are fixed to the left side */}
        <div className='y-axis-panel' style={{ width: yAxisPanelWidth }}>
          <svg>
            {yAxisPanelSvgContent}
          </svg>
        </div>

        {/* The main, scrollable diagram */}
        <div
          ref={(container) => { this.container = container }}
          onMouseMove={this._onMouseMove}
          onMouseLeave={this._onMouseLeave}
          className='main-diagram'
          style={{ left: 40 }}
        >
          <svg height={height} width={width + 10}>
            {backgroundSvgContent}
            {mainSvgContent}
            {foregroundSvgContent}
          </svg>
        </div>

        {/* The close button */}
        <Button
          className='close-button clear-button-formatting'
          onClick={this._onCloseButtonClick}
        >
          <i className='fa fa-close' />
        </Button>
      </div>
    )
  }
}

function compressStreetName (name) {
  return name.split(' ').map(str => {
    if (str === 'Northwest') return 'NW'
    if (str === 'Northeast') return 'NE'
    if (str === 'Southwest') return 'SW'
    if (str === 'Southeast') return 'SE'
    if (str === 'North') return 'N'
    if (str === 'East') return 'E'
    if (str === 'South') return 'S'
    if (str === 'West') return 'W'
    if (str === 'Street') return 'St'
    if (str === 'Avenue') return 'Ave'
    if (str === 'Road') return 'Rd'
    if (str === 'Drive') return 'Dr'
    if (str === 'Boulevard') return 'Blvd'
    return str
  }).join(' ')
}

// Connect to Redux store

const mapStateToProps = (state, ownProps) => {
  return {
    elevationPoint: state.otp.ui.elevationPoint
  }
}

const mapDispatchToProps = {
  showLegDiagram,
  setElevationPoint
}

export default connect(mapStateToProps, mapDispatchToProps)(LegDiagram)
