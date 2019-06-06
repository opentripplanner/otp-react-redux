import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Endpoint from './endpoint'
import { rememberPlace, setLocation } from '../../actions/map'

class EndpointsOverlay extends Component {
  static propTypes = {
    query: PropTypes.object
  }
  render () {
    const { from, to } = this.props.query
    return (
      <div>
        <Endpoint type='from' location={from} {...this.props} />
        <Endpoint type='to' location={to} {...this.props} />
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  rememberPlace,
  setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(EndpointsOverlay)
