import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { routingQuery } from '../../actions/api'

class PlanTripButton extends Component {
  static propTypes = {
    routingType: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.func,
    planTrip: PropTypes.func,
    profileTrip: PropTypes.func
  }

  _onClick = () => {
    this.props.routingQuery()
    if (typeof this.props.onClick === 'function') this.props.onClick()
  }

  render () {
    const { disabled, text } = this.props
    const displayText = text || disabled
      ? 'Complete trip details to plan trip'
      : 'Plan Trip'
    return (
      <Button
        className='plan-trip-button'
        disabled={disabled}
        onClick={this._onClick}
      >{displayText}</Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  // Set button to disabled if from or to location is missing.
  const disabled = !state.otp.currentQuery.from || !state.otp.currentQuery.to
  return { disabled }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    routingQuery: () => { dispatch(routingQuery()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanTripButton)
