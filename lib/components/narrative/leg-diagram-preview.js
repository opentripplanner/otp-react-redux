import React, {PropTypes, Component} from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import ReactResizeDetector from 'react-resize-detector'

import { showLegDiagram } from '../../actions/map'

class LegDiagramPreview extends Component {
  static propTypes = {
    leg: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = { width: null }
  }

  _onResize = (width, height) => {
    if (width > 0) {
      this.setState({ width })
    }
  }

  _onExpandClick = () => {
    this.props.showLegDiagram(this.props.leg)
  }

  render () {
    const { leg } = this.props

    // Don't show for very short legs
    if (leg.distance < 500 || leg.mode === 'CAR') return null

    return (
      <div className='leg-diagram-preview'>
        {/* The preview elevation SVG */}
        <div className='diagram'>
          {generateSvg(leg.steps, this.state.width)}
          <ReactResizeDetector handleWidth onResize={this._onResize} />
        </div>

        {/* The button to show the expanded map-inset view */}
        <div className='expand-button-container'>
          <Button
            className='expand-button'
            bsSize='xsmall'
            onClick={this._onExpandClick}
          >
            <i className='fa fa-expand' />
          </Button>
        </div>
      </div>
    )
  }
}

function generateSvg (steps, width) {
  const height = 30
  let minElev = 100000
  let maxElev = -100000
  let traversed = 0
  let ptArr = []

  // Iterate through the steps, building the array of elevation points and
  // keeping track of the minimum and maximum elevations reached
  steps.forEach(step => {
    if (!step.elevation || step.elevation.length === 0) {
      traversed += step.distance
      return
    }
    for (let i = 0; i < step.elevation.length; i++) {
      const elev = step.elevation[i]
      if (elev.second < minElev) minElev = elev.second
      if (elev.second > maxElev) maxElev = elev.second
      ptArr.push([traversed + elev.first, elev.second])
    }
    traversed += step.distance
  })

  // Pad the min-max range by 25m on either side
  minElev -= 25
  maxElev += 25

  // Transform the point array and store it as an SVG-ready string
  const pts = ptArr.map(pt => {
    const x = (pt[0] / traversed) * width
    const y = height - height * (pt[1] - minElev) / (maxElev - minElev)
    return x + ',' + y
  }).join(' ')

  // Render the SVG
  return (
    <svg height={height} width={width}>
      <polyline
        points={pts}
        fill='none'
        stroke='black'
        strokeWidth={2}
      />
    </svg>
  )
}

// Connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = {
  showLegDiagram
}

export default connect(mapStateToProps, mapDispatchToProps)(LegDiagramPreview)
