import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Endpoint from './endpoint'
import { clearLocation, forgetPlace, rememberPlace, setLocation } from '../../actions/map'
import { getActiveSearch } from '../../util/state'

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
  // Use query from active search (if a search has been made) or default to
  // current query is no search is available.
  const activeSearch = getActiveSearch(state.otp)
  const query = activeSearch ? activeSearch.query : state.otp.currentQuery
  return {
    query,
    locations: state.otp.user.locations
  }
}

const mapDispatchToProps = {
  forgetPlace,
  rememberPlace,
  setLocation,
  clearLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(EndpointsOverlay)
