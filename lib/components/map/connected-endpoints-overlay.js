/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import EndpointsOverlay from '@opentripplanner/endpoints-overlay'
import React, { useCallback } from 'react'

import { clearLocation } from '../../actions/form'
import { forgetPlace, rememberPlace } from '../../actions/user'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { getUserLocations } from '../../util/user'
import { setLocation } from '../../actions/map'

const ConnectedEndpointsOverlay = (props) => {
  const intl = useIntl()
  const _forgetPlace = useCallback(
    (place) => {
      props.forgetPlace(place, intl)
    },
    [props, intl]
  )
  return <EndpointsOverlay {...props} forgetPlace={_forgetPlace} />
}

// connect to the redux store

const mapStateToProps = (state) => {
  const { viewedRoute } = state.otp.ui
  // If the route viewer is active, do not show itinerary on map.
  // mainPanelContent is null whenever the trip planner is active.
  // Some views like the stop viewer can be accessed via the trip planner
  // or the route viewer, so include a route being viewed as a condition
  // for hiding
  if (state.otp.ui.mainPanelContent !== null && viewedRoute) {
    return {}
  }

  // Use query from active search (if a search has been made) or default to
  // current query is no search is available.
  const activeSearch = getActiveSearch(state)
  const query = activeSearch ? activeSearch.query : state.otp.currentQuery
  const showUserSettings = getShowUserSettings(state)
  const { from, to } = query
  // Intermediate places doesn't trigger a re-plan, so for now default to
  // current query. FIXME: Determine with TriMet if this is desired behavior.
  const places = state.otp.currentQuery.intermediatePlaces.filter((p) => p)

  return {
    fromLocation: from,
    intermediatePlaces: places,
    locations: getUserLocations(state).saved,
    showUserSettings,
    toLocation: to,
    visible: true
  }
}

const mapDispatchToProps = {
  clearLocation,
  forgetPlace,
  rememberPlace,
  setLocation
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedEndpointsOverlay)
