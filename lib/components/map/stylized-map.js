import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Transitive from 'transitive-js'

import { getActiveSearch, getActiveItineraries } from '../../util/state'
import { isBikeshareStation, itineraryToTransitive } from '../../util/map'

const extendedStyles = {
  segments: {
    // override the default stroke width
    'stroke-width': (display, segment, index, utils) => {
      switch (segment.type) {
        case 'CAR':
          return utils.pixels(display.zoom.scale(), 2, 4, 6) + 'px'
        case 'WALK':
          return '5px'
        case 'BICYCLE':
        case 'BICYCLE_RENT':
          return '4px'
        case 'TRANSIT':
          // bus segments:
          if (segment.mode === 3) {
            return utils.pixels(display.zoom.scale(), 4, 8, 12) + 'px'
          }
          // all others:
          return utils.pixels(display.zoom.scale(), 6, 12, 18) + 'px'
      }
    }
  },
  places_icon: {
    display: function (display, data) {
      const place = data.owner
      if (
        place.getId() !== 'from' &&
        place.getId() !== 'to' &&
        !isBikeshareStation(place)
      ) {
        return 'none'
      }
    }
  }
}

// extend common transitive styles for stylized map view
function mergeTransitiveStyles (base, extended) {
  const styles = Object.assign({}, base)
  for (const key in extended) {
    if (key in base) styles[key] = Object.assign({}, styles[key], extended[key])
    else styles[key] = extended[key]
  }
  return styles
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
    this._transitive = new Transitive({
      el: document.getElementById('trn-canvas'),
      styles: mergeTransitiveStyles(
        require('./transitive-styles'),
        extendedStyles
      ),
      drawGrid: true,
      gridCellSize: 200,
      zoomFactors: [
        {
          minScale: 0,
          gridCellSize: 300,
          internalVertexFactor: 1000000,
          angleConstraint: 45,
          mergeVertexThreshold: 200
        }
      ]
    })
    this._transitive.render()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.transitiveData !== this.props.transitiveData) {
      this._transitive.updateData(nextProps.transitiveData)
      this._transitive.render()
    }

    if ( // this block only applies for profile trips where active option changed
      nextProps.routingType === 'PROFILE' &&
      nextProps.activeItinerary !== this.props.activeItinerary
    ) {
      if (nextProps.activeItinerary == null) {
        // no option selected; clear focus
        this._transitive.focusJourney(null)
        this._transitive.refresh()
      } else if (nextProps.transitiveData) {
        this._transitive.focusJourney(
          nextProps.transitiveData.journeys[nextProps.activeItinerary]
            .journey_id
        )
        this._transitive.refresh()
      }
    }
  }

  render () {
    return (
      <div
        id='trn-canvas'
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      />
    )
  }
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  let transitiveData = null
  if (
    activeSearch &&
    activeSearch.query.routingType === 'ITINERARY' &&
    activeSearch.response &&
    activeSearch.response.plan
  ) {
    const itins = getActiveItineraries(state.otp)
    transitiveData = itineraryToTransitive(itins[activeSearch.activeItinerary])
  } else if (
    activeSearch &&
    activeSearch.response &&
    activeSearch.response.otp
  ) {
    transitiveData = activeSearch.response.otp
  }

  return {
    transitiveData,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    routingType: activeSearch && activeSearch.query && activeSearch.query.routingType
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(StylizedMap)
