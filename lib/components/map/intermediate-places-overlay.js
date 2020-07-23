import { Marker } from 'react-leaflet'
import React, {Component} from 'react'
import { connect } from 'react-redux'

import {
  clearLocation,
  forgetPlace,
  rememberPlace,
  setLocation
} from '../../actions/map'
import { getShowUserSettings } from '../../util/state'

class IntermediatePlacesOverlay extends Component {
  render () {
    const {intermediatePlaces} = this.props
    return (
      <>
        {Array.isArray(intermediatePlaces) && intermediatePlaces.map((place, i) => {
          return place && place.lat && place.lon
            ? <Marker key={i} position={[place.lat, place.lon]} />
            : null
        })}
      </>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  // FIXME: should we use query from active search (if a search has been made) or default to
  // current query is no search is available. Currently we're just using currentQuery
  // const activeSearch = getActiveSearch(state.otp)
  const query = state.otp.currentQuery // activeSearch ? activeSearch.query : state.otp.currentQuery
  const showUserSettings = getShowUserSettings(state.otp)
  return {
    intermediatePlaces: query.intermediatePlaces,
    locations: state.otp.user.locations,
    showUserSettings,
    visible: true
  }
}

const mapDispatchToProps = {
  forgetPlace,
  rememberPlace,
  setLocation,
  clearLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(IntermediatePlacesOverlay)
