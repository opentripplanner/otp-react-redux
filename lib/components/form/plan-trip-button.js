import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { planTrip } from '../../actions/api'

class PlanTripButton extends Component {

  static propTypes = {
    onClick: PropTypes.func
  }

  render () {
    return (
      <Button onClick={this.props.onClick}>Plan Trip</Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => { dispatch(planTrip()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanTripButton)
