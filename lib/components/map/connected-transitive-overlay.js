import coreUtils from '@opentripplanner/core-utils'
import TransitiveCanvasOverlay from '@opentripplanner/transitive-overlay'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { ComponentContext } from '../../util/contexts'
import { getActiveItinerary, getActiveItineraries, getActiveSearch } from '../../util/state'

/**
 * Wrapper for TransitiveCanvasOverlay that passes getTransitiveRouteLabel defined in ComponentContext.
 */
class TransitiveCanvasOverlayWithContext extends Component {
  static contextType = ComponentContext

  render () {
    const { activeSearchResponseOtp, activeSearchVisibleItinerary, ...otherProps } = this.props
    let transitiveData = null
    if (activeSearchVisibleItinerary) {
      transitiveData = coreUtils.map.itineraryToTransitive(activeSearchVisibleItinerary, null, this.context.getTransitiveRouteLabel)
    } else if (activeSearchResponseOtp) {
      transitiveData = activeSearchResponseOtp
    }

    return <TransitiveCanvasOverlay {...otherProps} transitiveData={transitiveData} />
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const { activeItinerary, query, response, visibleItinerary } = activeSearch || {}
  const { labeledModes, styles } = state.otp.config.map.transitive || {}
  let activeSearchVisibleItinerary = null
  let activeSearchResponseOtp = null

  if (response) {
    if (query.routingType === 'ITINERARY' && response.length > 0) {
      // FIXME: This may need some simplification.
      const itins = getActiveItineraries(state.otp)
      const visibleIndex = visibleItinerary !== undefined && visibleItinerary !== null
        ? visibleItinerary
        : activeItinerary
      // TODO: prevent itineraryToTransitive() from being called more than needed
      activeSearchVisibleItinerary = itins[visibleIndex] || getActiveItinerary(state.otp)
    } else if (response.otp) {
      activeSearchResponseOtp = response.otp
    }
  }

  return {
    activeItinerary,
    activeSearchResponseOtp,
    activeSearchVisibleItinerary,
    labeledModes,
    routingType: query && query.routingType,
    styles,
    visible: true
  }
}

export default connect(mapStateToProps)(TransitiveCanvasOverlayWithContext)
