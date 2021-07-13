import { select, event } from 'd3-selection'
import { zoom } from 'd3-zoom'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Transitive from 'transitive-js'

import { getActiveSearch, getActiveItineraries } from '../../util/state'

var STYLES = {}

STYLES.places = {
  display: function (display, place) {
    if (
      place.getId() !== 'from' &&
      place.getId() !== 'to' &&
      !coreUtils.map.isBikeshareStation(place)
    ) {
      return 'none'
    }
  },
  fill: '#fff',
  r: 8,
  stroke: '#000',
  'stroke-width': 2
}

STYLES.stops_merged = {
  r: function (display, data, index, utils) {
    return 6
  }
}

class StylizedMap extends Component {
  static propTypes = {
    activeItinerary: PropTypes.number,
    routingType: PropTypes.string,
    toggleLabel: PropTypes.element,
    transitiveData: PropTypes.object
  }

  static defaultProps = {
    toggleName: 'Stylized'
  }

  componentDidMount () {
    const el = document.getElementById('trn-canvas')
    this._transitive = new Transitive({
      display: 'svg',
      el,
      gridCellSize: 200,
      styles: STYLES,
      zoomFactors: [
        {
          angleConstraint: 45,
          gridCellSize: 300,
          internalVertexFactor: 1000000,
          mergeVertexThreshold: 200,
          minScale: 0
        }
      ]
    })
    this._transitive.render()

    select(el).call(zoom()
      .scaleExtent([1 / 2, 4])
      .on('zoom', () => {
        this._transitive.setTransform(event.transform)
      })
    )
  }

  componentDidUpdate (prevProps) {
    if (prevProps.transitiveData !== this.props.transitiveData) {
      this._transitive.updateData(this.props.transitiveData, true)
      this._transitive.render()
    }

    if ( // this block only applies for profile trips where active option changed
      this.props.routingType === 'PROFILE' &&
      prevProps.activeItinerary !== this.props.activeItinerary
    ) {
      if (this.props.activeItinerary == null) {
        // no option selected; clear focus
        this._transitive.focusJourney(null)
        this._transitive.render()
      } else if (this.props.transitiveData) {
        this._transitive.focusJourney(
          this.props.transitiveData.journeys[this.props.activeItinerary]
            .journey_id
        )
        this._transitive.render()
      }
    }
  }

  render () {
    return (
      <div
        id='trn-canvas'
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
    )
  }
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state)
  let transitiveData = null
  if (
    activeSearch &&
    activeSearch.query.routingType === 'ITINERARY' &&
    activeSearch.response &&
    activeSearch.response.plan
  ) {
    const itins = getActiveItineraries(state)
    const visibleItinerary = itins[activeSearch.activeItinerary]
    if (visibleItinerary) transitiveData = coreUtils.map.itineraryToTransitive(visibleItinerary)
  } else if (
    activeSearch &&
    activeSearch.response &&
    activeSearch.response.otp
  ) {
    transitiveData = activeSearch.response.otp
  }

  return {
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    routingType: activeSearch && activeSearch.query && activeSearch.query.routingType,
    transitiveData
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(StylizedMap)
