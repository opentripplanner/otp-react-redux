import PrintableItinerary from '@opentripplanner/printable-itinerary'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { parseUrlQueryString } from '../../actions/form'
import { routingQuery } from '../../actions/api'
import DefaultMap from '../map/default-map'
import TripDetails from '../narrative/connected-trip-details'
import { ComponentContext } from '../../util/contexts'
import { getActiveItinerary } from '../../util/state'

class PrintLayout extends Component {
  static propTypes = {
    itinerary: PropTypes.object,
    parseUrlQueryString: PropTypes.func
  }

  static contextType = ComponentContext

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
    const { location, parseUrlQueryString } = this.props
    // Add print-view class to html tag to ensure that iOS scroll fix only applies
    // to non-print views.
    const root = document.getElementsByTagName('html')[0]
    root.setAttribute('class', 'print-view')
    // Parse the URL query parameters, if present
    if (location && location.search) {
      parseUrlQueryString()
    }
  }

  /**
   * Remove class attribute from html tag on clean up.
   */
  componentWillUnmount () {
    const root = document.getElementsByTagName('html')[0]
    root.removeAttribute('class')
  }

  render () {
    const { config, itinerary } = this.props
    const { LegIcon } = this.context

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
            <DefaultMap />
          </div>
        }

        {/* The main itinerary body */}
        {itinerary &&
          <>
            <PrintableItinerary
              config={config}
              itinerary={itinerary}
              LegIcon={LegIcon}
            />
            <TripDetails itinerary={itinerary} />
          </>
        }
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    itinerary: getActiveItinerary(state)
  }
}

const mapDispatchToProps = {
  parseUrlQueryString,
  routingQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintLayout)
