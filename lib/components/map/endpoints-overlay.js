import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Endpoint from './endpoint'
import { clearLocation, forgetPlace, rememberPlace, setLocation } from '../../actions/map'
import { getActiveSearch, getShowUserSettings } from '../../util/state'

class EndpointsOverlay extends Component {
  static propTypes = {
    query: PropTypes.object
  }
  render () {
    const { query, showUserSettings } = this.props
    const { from, to } = query
    return (
      <div>
        <Endpoint
          type='from'
          showPopup={showUserSettings}
          location={from}
          {...this.props} />
        <Endpoint
          type='to'
          showPopup={showUserSettings}
          location={to}
          {...this.props} />
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
  const showUserSettings = getShowUserSettings(state.otp)
  return {
    locations: state.otp.user.locations,
    query,
    showUserSettings
  }
}

const mapDispatchToProps = {
  forgetPlace,
  rememberPlace,
  setLocation,
  clearLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(EndpointsOverlay)
