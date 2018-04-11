import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import BaseMap from '../map/base-map'
import EndpointsOverlay from '../map/endpoints-overlay'
import TransitiveOverlay from '../map/transitive-overlay'
import PrintableItinerary from '../narrative/printable/printable-itinerary'
import { parseUrlQueryString } from '../../actions/form'
import { getActiveItinerary } from '../../util/state'

class PrintLayout extends Component {
  static propTypes = {
    itinerary: PropTypes.object,
    parseQueryString: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      mapVisible: true
    }
  }

  _toggleMap = () => {
    this.setState({ mapVisible: !this.state.mapVisible })
  }

  _print = () => {
    window.print()
  }

  componentDidMount () {
    const { location } = this.props
    // Parse the URL query parameters, if present
    if (location && location.search) {
      this.props.parseUrlQueryString(location.search)
    }
  }

  render () {
    const { itinerary } = this.props
    return (
      <div className='otp print-layout'>
        {/* The header bar, including the Toggle Map and Print buttons */}
        <div className='header'>
          <div style={{ float: 'right' }}>
            <Button bsSize='small' onClick={this._toggleMap}>
              <i className='fa fa-map' /> Toggle Map
            </Button>
            {' '}
            <Button bsSize='small' onClick={this._print}>
              <i className='fa fa-print' /> Print
            </Button>
          </div>
          Itinerary
        </div>

        {/* The map, if visible */}
        {this.state.mapVisible &&
          <div className='map-container'>
            <BaseMap>
              <TransitiveOverlay />
              <EndpointsOverlay />
            </BaseMap>
          </div>
        }

        {/* The main itinerary body */}
        {itinerary && <PrintableItinerary itinerary={itinerary} />}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    itinerary: getActiveItinerary(state.otp)
  }
}

const mapDispatchToProps = {
  parseUrlQueryString
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintLayout)
