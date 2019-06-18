import React, {PropTypes, Component} from 'react'
import { connect } from 'react-redux'
import ReactResizeDetector from 'react-resize-detector'

import { showLegDiagram } from '../../actions/map'
import { getElevationProfile } from '../../util/itinerary'

const METERS_TO_FEET = 3.28084

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
    if (this.props.diagramVisible) this.props.showLegDiagram(null)
    else this.props.showLegDiagram(this.props.leg)
  }

  /** Round elevation to whole number and add symbol. */
  _formatElevation (elev) {
    return Math.round(elev) + `'`
  }

  render () {
    const { leg, showElevationProfile } = this.props
    if (!showElevationProfile) return null
    const profile = getElevationProfile(leg.steps)
    // Don't show for very short legs
    if (leg.distance < 500 || leg.mode === 'CAR') return null

    return (
      <div className={`leg-diagram-preview ${this.props.diagramVisible ? 'on' : ''}`}>
        {/* The preview elevation SVG */}
        <div
          className='diagram'
          tabIndex='0'
          title='Toggle elevation chart'
          role='button'
          onClick={this._onExpandClick}>
          <div className='diagram-title text-center'>
            Elevation chart{' '}
            <span style={{ fontSize: 'xx-small', color: 'red' }}>↑{this._formatElevation(profile.gain * METERS_TO_FEET)}{'  '}</span>
            <span style={{ fontSize: 'xx-small', color: 'green' }}>↓{this._formatElevation(-profile.loss * METERS_TO_FEET)}</span>
          </div>
          {generateSvg(profile, this.state.width)}
          <ReactResizeDetector handleWidth onResize={this._onResize} />
        </div>
      </div>
    )
  }
}

function generateSvg (profile, width) {
  const height = 30
  let { minElev, maxElev, points: ptArr, traversed } = profile
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
        strokeWidth={1.3}
      />
    </svg>
  )
}

// Connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    diagramVisible: state.otp.ui.diagramLeg,
    showElevationProfile: Boolean(state.otp.config.elevationProfile)
  }
}

const mapDispatchToProps = {
  showLegDiagram
}

export default connect(mapStateToProps, mapDispatchToProps)(LegDiagramPreview)
