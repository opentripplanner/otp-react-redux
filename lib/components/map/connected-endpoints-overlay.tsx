import { connect } from 'react-redux'
import { IntlShape, useIntl } from 'react-intl'
import { UserLocationAndType } from '@opentripplanner/types'
import EndpointsOverlay from '@opentripplanner/endpoints-overlay'
import React, { ComponentProps, useCallback } from 'react'

import { clearLocation } from '../../actions/form'
import { convertToPlace, getUserLocations } from '../../util/user'
import {
  forgetPlace,
  rememberPlace,
  UserActionResult
} from '../../actions/user'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { setLocation } from '../../actions/map'
import { toastOnPlaceSaved } from '../util/toasts'

type Props = ComponentProps<typeof EndpointsOverlay> & {
  forgetPlace: (place: string, intl: IntlShape) => void
  rememberPlace: (arg: UserLocationAndType, intl: IntlShape) => number
}

const ConnectedEndpointsOverlay = ({
  forgetPlace,
  rememberPlace,
  ...otherProps
}: Props): JSX.Element => {
  const intl = useIntl()
  const _forgetPlace = useCallback(
    (place) => {
      forgetPlace(place, intl)
    },
    [forgetPlace, intl]
  )

  const _rememberPlace = useCallback(
    async (placeTypeLocation) => {
      const result = await rememberPlace(placeTypeLocation, intl)
      if (result === UserActionResult.SUCCESS) {
        toastOnPlaceSaved(convertToPlace(placeTypeLocation.location), intl)
      }
    },
    [rememberPlace, intl]
  )
  return (
    <EndpointsOverlay
      {...otherProps}
      forgetPlace={_forgetPlace}
      rememberPlace={_rememberPlace}
    />
  )
}

// connect to the redux store
// TODO: Add TypeScript to this section.

const mapStateToProps = (state: any) => {
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
  const activeSearch: any = getActiveSearch(state)
  const query = activeSearch ? activeSearch.query : state.otp.currentQuery
  const showUserSettings = getShowUserSettings(state)
  const { from, to } = query
  // Intermediate places doesn't trigger a re-plan, so for now default to
  // current query. FIXME: Determine with TriMet if this is desired behavior.
  const places = state.otp.currentQuery.intermediatePlaces.filter((p: any) => p)

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
