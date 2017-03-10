import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { planTrip } from '../../actions/api'

class PlanTripButton extends Component {
  static propTypes = {
    onClick: PropTypes.func
  }
  _onClick = () => {
    this.props.planTrip()
  }
  render () {
    return (
      <Button
        onClick={this._onClick || this.props.onClick}
        >Plan Trip</Button>
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
