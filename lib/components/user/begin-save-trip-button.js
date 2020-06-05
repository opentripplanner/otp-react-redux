import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import { routeTo } from '../../actions/ui'

/**
 * TODO? Embed _handleClick inside itinerary summary.
 * This button redirects to /savetrip to let a user define a monitored trip.
 */
class BeginSaveTripButton extends Component {
  _handleClick = () => {
    this.props.routeTo('/savetrip')
  }

  render () {
    return <Button onClick={this._handleClick}>Save</Button>
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(BeginSaveTripButton)
