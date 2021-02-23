import moment from 'moment'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { LinkWithQuery } from '../form/connected-links'
import MainPanelPlace from '../user/places/main-panel-place'
import PlaceShortcut from '../user/places/place-shortcut'
import {
  PERSIST_TO_LOCAL_STORAGE,
  PERSIST_TO_OTP_MIDDLEWARE,
  PLACES_PATH
} from '../../util/constants'
import { getPersistenceStrategy, isHome, isWork } from '../../util/user'
import { UnpaddedList } from './styled'

const { summarizeQuery } = coreUtils.query

class UserSettings extends Component {
  _disableTracking = () => {
    const { localUser, localUserTripRequests, toggleTracking } = this.props
    if (!localUser.storeTripHistory) return
    const hasRecents = (localUser.recentPlaces && localUser.recentPlaces.length > 0) ||
      (localUserTripRequests && localUserTripRequests.length > 0)

    // If user has recents and does not confirm deletion, return without doing
    // anything.
    if (hasRecents && !window.confirm('You have recent searches and/or places stored. Disabling storage of recent places/searches will remove these items. Continue?')) {
      return
    }
    // Disable tracking if we reach this statement.
    toggleTracking(false)
  }

  _enableTracking = () => !this.props.localUser.storeTripHistory && this.props.toggleTracking(true)

  _getLocations = user => {
    const locations = [...user.savedLocations]
    if (!locations.find(isWork)) {
      locations.push({
        blank: true,
        icon: 'briefcase',
        id: 'work',
        name: 'click to add',
        type: 'work'
      })
    }
    if (!locations.find(isHome)) {
      locations.push({
        blank: true,
        icon: 'home',
        id: 'home',
        name: 'click to add',
        type: 'home'
      })
    }
    return locations
  }

  render () {
    const {
      className,
      deleteLocalUserRecentPlace,
      deleteLocalUserSavedPlace,
      deleteLocalUserStop,
      deleteUserPlace,
      forgetSearch,
      localUser,
      loggedInUser,
      persistenceStrategy,
      setQueryParam,
      setViewedStop,
      storageDisclaimer,
      tripRequests,
      trueUser
    } = this.props

    if (loggedInUser && persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE) {
      // Add id attribute using index, that will be used to call deleteUserPlace.
      const loggedInUserLocations = loggedInUser.savedLocations.map((loc, index) => ({
        ...loc,
        id: index
      }))
      const savedPlacesHeader = (
        <>
          My saved places (
          <LinkWithQuery to='/account/settings'>
              manage
          </LinkWithQuery>
          )
        </>
      )

      return (
        <div className={`user-settings ${className}`}>
          <Places
            basePath={PLACES_PATH}
            header={savedPlacesHeader}
            onDelete={deleteUserPlace}
            places={loggedInUserLocations}
            separator={false}
          />

          <RecentTrips
            forgetSearch={forgetSearch}
            setQueryParam={setQueryParam}
            tripRequests={tripRequests}
            user={trueUser}
          />
        </div>
      )
    } else if (persistenceStrategy === PERSIST_TO_LOCAL_STORAGE) {
      const { favoriteStops, storeTripHistory, recentPlaces } = localUser
      // Clone locations in order to prevent blank locations from seeping into the
      // app state/store.
      const locations = this._getLocations(localUser)
      const order = ['home', 'work', 'suggested', 'stop', 'recent']
      const sortedLocations = locations
        .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
      return (
        <div className={`user-settings ${className}`}>
          {/* Sorted locations are shown regardless of tracking. */}
          <Places
            onDelete={deleteLocalUserSavedPlace}
            places={sortedLocations}
            separator={false}
          />

          {/* Favorite stops are shown regardless of tracking. */}
          <Places
            header='Favorite stops'
            onDelete={deleteLocalUserStop}
            onView={setViewedStop}
            places={favoriteStops}
            textIfEmpty='No favorite stops'
          />

          {storeTripHistory && <Places
            header='Recent places'
            onDelete={deleteLocalUserRecentPlace}
            places={recentPlaces}
          />}

          <RecentTrips
            forgetSearch={forgetSearch}
            setQueryParam={setQueryParam}
            tripRequests={tripRequests}
            user={trueUser}
          />

          <hr />
          <div className='remember-settings'>
            <div className='section-header'>My preferences</div>
            <small>Remember recent searches/places?</small>
            <Button
              bsSize='xsmall'
              bsStyle='link'
              className={storeTripHistory ? 'active' : ''}
              onClick={this._enableTracking}>Yes</Button>
            <Button
              bsSize='xsmall'
              bsStyle='link'
              className={!storeTripHistory ? 'active' : ''}
              onClick={this._disableTracking}>No</Button>
          </div>
          {storageDisclaimer &&
            <div>
              <hr />
              <div className='disclaimer'>
                {storageDisclaimer}
              </div>
            </div>
          }
        </div>
      )
    }

    return null
  }
}

/**
 * Displays a list of places with a header.
 */
const Places = ({
  basePath,
  header,
  onDelete,
  onView,
  places,
  separator = true,
  textIfEmpty
}) => {
  const shouldRender = textIfEmpty || (places && places.length > 0)
  return shouldRender && (
    <>
      {separator && <hr />}
      {header && <div className='section-header'>{header}</div>}
      <UnpaddedList>
        {places.length > 0
          ? places.map((location, index) => (
            <PlaceShortcut
              key={location.id || index}
              onDelete={onDelete}
              onView={onView}
              path={basePath && `${basePath}/${index}`}
              place={location}
            />
          ))
          : textIfEmpty && <small>{textIfEmpty}</small>
        }
      </UnpaddedList>
    </>
  )
}

/**
 * Wraps MainPanelPlace for recent trip requests.
 */
class TripRequest extends Component {
  _onSelect = () => {
    const { setQueryParam, tripRequest } = this.props
    const { id, query } = tripRequest
    // Update query params and initiate search.
    setQueryParam(query, id)
  }

  _onForget = () => this.props.forgetSearch(this.props.tripRequest.id)

  render () {
    const { tripRequest, user } = this.props
    const { canDelete = true, query, timestamp } = tripRequest
    const name = summarizeQuery(query, user.savedLocations)
    const timeInfo = moment(timestamp).fromNow()

    const place = {
      details: timeInfo,
      icon: 'clock-o',
      name,
      title: `${name} (${timeInfo})`
    }

    return (
      <MainPanelPlace
        onClick={this._onSelect}
        onDelete={canDelete && this._onForget}
        place={place}
      />
    )
  }
}

/**
 * Renders a list of recent trip requests, most recent first,
 * if permitted by user.
 */
const RecentTrips = ({ forgetSearch, setQueryParam, tripRequests = null, user }) => (
  // Note: tripRequests can be undefined,
  // so we have to coerce it to null to make a valid render.
  user.storeTripHistory && tripRequests && tripRequests.length > 0 && (
    <div className='recent-searches-container'>
      <hr />
      <div className='section-header'>Recent searches</div>
      <UnpaddedList>
        {tripRequests
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(tripReq => (
            <TripRequest
              forgetSearch={forgetSearch}
              key={tripReq.id}
              setQueryParam={setQueryParam}
              tripRequest={tripReq}
              user={user}
            />
          ))
        }
      </UnpaddedList>
    </div>
  )
)
// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { config, currentQuery, location, transitIndex } = state.otp
  const { language, persistence } = config
  const { localUser, localUserTripRequests, loggedInUser, loggedInUserTripRequests } = state.user
  return {
    config,
    currentPosition: location.currentPosition,
    localUser, // these users should be merged in mapStateToProps
    localUserTripRequests,
    loggedInUser,
    loggedInUserTripRequests,
    nearbyStops: location.nearbyStops,
    persistenceStrategy: getPersistenceStrategy(persistence),
    query: currentQuery,
    sessionSearches: location.sessionSearches,
    stopsIndex: transitIndex.stops,
    storageDisclaimer: language.storageDisclaimer,
    tripRequests: loggedInUser ? loggedInUserTripRequests : localUserTripRequests,
    trueUser: loggedInUser || localUser
  }
}

const mapDispatchToProps = {
  deleteLocalUserRecentPlace: userActions.deleteLocalUserRecentPlace,
  deleteLocalUserSavedPlace: userActions.deleteLocalUserSavedPlace,
  deleteLocalUserStop: userActions.deleteLocalUserStop,
  deleteUserPlace: userActions.deleteUserPlace,
  forgetSearch: apiActions.forgetSearch,
  setLocation: mapActions.setLocation,
  setQueryParam: formActions.setQueryParam,
  setViewedStop: uiActions.setViewedStop,
  toggleTracking: apiActions.toggleTracking
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings)
