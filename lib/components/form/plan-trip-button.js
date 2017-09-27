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
    routingQuery: () => { dispatch(routingQuery()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanTripButton)
