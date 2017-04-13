import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { planTrip } from '../../actions/api'

class PlanTripButton extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    text: PropTypes.string
  }
  _onClick = () => {
    this.props.planTrip()
  }
  render () {
    return (
      <Button
        className='plan-trip-button'
        onClick={this._onClick || this.props.onClick}
      >{this.props.text || 'Plan Trip'}</Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    planTrip: () => { dispatch(planTrip()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanTripButton)
