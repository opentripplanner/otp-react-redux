import React, { Component } from 'react'
import { connect } from 'react-redux'

import FieldTripDetails from './field-trip-details'
import FieldTripList from './field-trip-list'

const WINDOW_WIDTH = 450
const MARGIN = 15

/**
 * Collects the various draggable windows for the Field Trip module.
 */
class FieldTripWindows extends Component {
  render () {
    const {callTaker} = this.props
    const {fieldTrip} = callTaker
    // Do not render details or list if visible is false.
    if (!fieldTrip.visible) return null
    return (
      <>
        <FieldTripDetails
          style={{
            bottom: `${MARGIN}px`,
            right: `${MARGIN * 2 + WINDOW_WIDTH}px`,
            width: `${WINDOW_WIDTH}px`,
            // Ensure this window stays above the list.
            zIndex: 9999999 + 1
          }}
        />
        <FieldTripList
          draggableProps={{positionOffset: {x: '-40%'}}}
          style={{
            bottom: `${MARGIN}px`,
            right: `${MARGIN}px`,
            width: `${WINDOW_WIDTH}px`
          }}
        />
      </>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    callTaker: state.callTaker
  }
}

export default connect(mapStateToProps)(FieldTripWindows)
