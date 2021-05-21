import TransitiveOverlay from '@opentripplanner/transitive-overlay'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getActiveSearch, getTransitiveData } from '../../util/state'

/**
 * Wrapper for TransitiveOverlay that avoids rerenders by checking transitive
 * data computed from redux store.
 */
class TransitiveCanvasOverlay extends Component {
  shouldComponentUpdate (nextProps) {
    return nextProps.transitiveData !== this.props.transitiveData
  }

  render () {
    const { transitiveData, ...otherProps } = this.props
    return (
      <TransitiveOverlay
        {...otherProps}
        transitiveData={transitiveData}
      />
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const { activeItinerary, query } = activeSearch || {}
  const { labeledModes, styles } = state.otp.config.map.transitive || {}

  return {
    activeItinerary,
    labeledModes,
    routingType: query && query.routingType,
    styles,
    transitiveData: getTransitiveData(state, ownProps)
  }
}

export default connect(mapStateToProps)(TransitiveCanvasOverlay)
