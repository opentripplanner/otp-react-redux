import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { planTrip, profileTrip } from '../../actions/api'

class PlanTripButton extends Component {
  static propTypes = {
    routingType: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.func,
    planTrip: PropTypes.func,
    profileTrip: PropTypes.func
  }

  _onClick = () => {
    switch (this.props.routingType) {
      case 'ITINERARY':
        this.props.planTrip()
        break
      case 'PROFILE':
        this.props.profileTrip()
        break
    }
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
  return {
    routingType: state.otp.currentQuery.routingType
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    planTrip: () => { dispatch(planTrip()) },
    profileTrip: () => { dispatch(profileTrip()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanTripButton)
