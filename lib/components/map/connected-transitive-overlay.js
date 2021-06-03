import TransitiveOverlay from '@opentripplanner/transitive-overlay'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getTransitiveData } from '../../util/state'

/**
 * Wrapper for TransitiveOverlay that avoids rerenders by checking transitive
 * data computed from redux store.
 */
class TransitiveCanvasOverlay extends Component {
  shouldComponentUpdate (nextProps) {
    return nextProps.transitiveData !== this.props.transitiveData
  }

  render () {
    const { labeledModes, styles, transitiveData } = this.props
    return (
      <TransitiveOverlay
        labeledModes={labeledModes}
        styles={styles}
        transitiveData={transitiveData}
      />
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { labeledModes, styles } = state.otp.config.map.transitive || {}

  return {
    labeledModes,
    styles,
    transitiveData: getTransitiveData(state, ownProps)
  }
}

export default connect(mapStateToProps)(TransitiveCanvasOverlay)
