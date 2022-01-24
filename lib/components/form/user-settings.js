/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import moment from 'moment'
import React, { Component, useCallback } from 'react'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import {
  getPersistenceStrategy,
  isHome,
  isHomeOrWork,
  isWork
} from '../../util/user'
import { LinkWithQuery } from '../form/connected-links'
import { PERSIST_TO_OTP_MIDDLEWARE } from '../../util/constants'
import { StyledMainPanelPlace } from '../user/places/styled'
import PlaceShortcut from '../user/places/place-shortcut'

import { UnpaddedList } from './styled'

const { toSentenceCase } = coreUtils.itinerary
const { summarizeQuery } = coreUtils.query

class UserSettings extends Component {
  _disableTracking = () => {
    const { intl, localUser, toggleTracking } = this.props
    const { recentPlaces, recentSearches, storeTripHistory } = localUser
    if (!storeTripHistory) return
    const hasRecents =
      (recentPlaces && recentPlaces.length > 0) ||
      (recentSearches && recentSearches.length > 0)

    // If user has recents and does not confirm deletion, return without doing
    // anything.
    if (
      hasRecents &&
      !window.confirm(
        intl.formatMessage({ id: 'components.UserSettings.confirmDeletion' })
      )
    ) {
      return
    }
    // Disable tracking if we reach this statement.
    toggleTracking(false)
  }

  _enableTracking = () =>
    !this.props.localUser.storeTripHistory && this.props.toggleTracking(true)

  _getLocalStorageOnlyContent = () => {
    const {
      deleteLocalUserRecentPlace,
      forgetSearch,
      forgetStop,
      localUser,
      setQueryParam,
      setViewedStop,
      storageDisclaimer
    } = this.props

    const { favoriteStops, recentPlaces, recentSearches, storeTripHistory } =
      localUser
    return (
      <>
        {/* Favorite stops are shown regardless of tracking. */}
        <Places
          getDetailText={(location) => `Stop ID: ${location.id}`}
          getMainText={(location) => location.address || location.name}
          header={
            <FormattedMessage id="components.UserSettings.favoriteStops" />
          }
          onDelete={forgetStop}
          onView={setViewedStop}
          places={favoriteStops}
          textIfEmpty={
            <FormattedMessage id="components.UserSettings.noFavoriteStops" />
          }
        />

        {storeTripHistory && (
          <Places
            getDetailText={(location) => moment(location.timestamp).fromNow()}
            getMainText={(location) => location.address || location.name}
            header={
              <FormattedMessage id="components.UserSettings.recentPlaces" />
            }
            onDelete={deleteLocalUserRecentPlace}
            places={recentPlaces}
          />
        )}
        {storeTripHistory && (
          <RecentTrips
            forgetSearch={forgetSearch}
            setQueryParam={setQueryParam}
            tripRequests={recentSearches}
            user={localUser}
          />
        )}
        <hr />
        <div className="remember-settings">
          <div className="section-header">
            <FormattedMessage id="components.UserSettings.myPreferences" />
          </div>
          <small>
            <FormattedMessage id="components.UserSettings.rememberSearches" />{' '}
          </small>
          <Button
            bsSize="xsmall"
            bsStyle="link"
            className={storeTripHistory ? 'active' : ''}
            onClick={this._enableTracking}
          >
            <FormattedMessage id="common.forms.yes" />
          </Button>
          <Button
            bsSize="xsmall"
            bsStyle="link"
            className={!storeTripHistory ? 'active' : ''}
            onClick={this._disableTracking}
          >
            <FormattedMessage id="common.forms.no" />
          </Button>
        </div>
        <div>
          <hr />
          <div className="disclaimer">
            <FormattedMessage id="components.UserSettings.storageDisclaimer" />
          </div>
        </div>
      </>
    )
  }

  _getLocations = (user) => {
    const locations = [...user.savedLocations]
    if (!locations.find(isWork)) {
      locations.push({
        blank: true,
        icon: 'briefcase',
        id: 'work',
        type: 'work'
      })
    }
    if (!locations.find(isHome)) {
      locations.push({
        blank: true,
        icon: 'home',
        id: 'home',
        type: 'home'
      })
    }
    return locations
  }

  render() {
    const {
      className,
      deleteUserPlace,
      forgetSearch,
      intl,
      localUser,
      loggedInUser,
      loggedInUserTripRequests,
      persistenceStrategy,
      setQueryParam,
      style
    } = this.props
    const isUsingOtpMiddleware =
      persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE
    const userNotLoggedIn = isUsingOtpMiddleware && !loggedInUser
    if (userNotLoggedIn) return null

    // Clone locations in order to prevent blank locations from seeping into the
    // app state/store.
    const locations = this._getLocations(
      isUsingOtpMiddleware ? loggedInUser : localUser
    )
    const order = ['home', 'work', 'suggested', 'stop', 'recent']
    const sortedLocations = isUsingOtpMiddleware
      ? locations
      : locations.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
    return (
      <div className={`user-settings ${className}`} style={style}>
        {/* Sorted locations are shown regardless of tracking. */}
        <Places
          getDetailText={(location) => {
            // FIXME_QBD: unify the two location models.
            return (
              (isUsingOtpMiddleware ? location.address : location.name) ||
              `Set your ${location.type} address`
            )
          }}
          getMainText={(location) => {
            return isHomeOrWork(location)
              ? toSentenceCase(location.type)
              : location.name
          }}
          header={
            isUsingOtpMiddleware && (
              <>
                My saved places (
                <LinkWithQuery to="/account/settings">manage</LinkWithQuery>)
              </>
            )
          }
          onDelete={deleteUserPlace}
          places={sortedLocations}
          separator={false}
        />
        {isUsingOtpMiddleware ? (
          <RecentTrips
            forgetSearch={forgetSearch}
            setQueryParam={setQueryParam}
            tripRequests={loggedInUserTripRequests}
            user={localUser}
          />
        ) : (
          this._getLocalStorageOnlyContent()
        )}
      </div>
    )
  }
}

/**
 * Displays a list of places with a header.
 */
const Places = ({
  getDetailText,
  getMainText,
  header,
  onDelete,
  onView,
  places,
  separator = true,
  textIfEmpty
}) => {
  const shouldRender = textIfEmpty || (places && places.length > 0)
  return (
    shouldRender && (
      <>
        {separator && <hr />}
        {header && <div className="section-header">{header}</div>}
        <UnpaddedList>
          {places.length > 0
            ? places.map((location, index) => {
                // FIXME_QBD Unify location models.
                // using the `return` syntax instead of `=>` to please both
                // prettier and react/jsx rules, otherwise they conflict.
                return (
                  <PlaceShortcut
                    detailText={getDetailText(location)}
                    icon={location.icon}
                    index={index}
                    key={location.id || index}
                    mainText={getMainText(location)}
                    onDelete={onDelete}
                    onView={onView}
                    place={location}
                  />
                )
              })
            : textIfEmpty && <small>{textIfEmpty}</small>}
        </UnpaddedList>
      </>
    )
  )
}

/**
 * Wrapper for recent trip requests.
 */
const TripRequest = ({ forgetSearch, setQueryParam, tripRequest, user }) => {
  const { canDelete = true, id, query, timestamp } = tripRequest

  const _onSelect = useCallback(
    // Update query params and initiate search.
    () => setQueryParam(query, id),
    [setQueryParam, query, id]
  )

  const _onForget = useCallback(
    () => forgetSearch(tripRequest),
    [forgetSearch, tripRequest]
  )

  const mainText = summarizeQuery(query, user.savedLocations).trim()
  // FIXME_QBD: can we use formatDuration?
  const fromNowDur = moment.duration(moment().diff(moment(timestamp)))
  const intl = useIntl()
  // This text will be shown in a tooltip, therefore
  // it is obtained using formaMessage rather than <FormattedfMessage>.
  const timeInfo = intl.formatMessage(
    { id: 'common.time.fromNowUpdate' },
    {
      days: fromNowDur.days(),
      hours: fromNowDur.hours(),
      minutes: fromNowDur.minutes()
    }
  )

  return (
    <StyledMainPanelPlace
      className="place-item"
      detailText={timeInfo}
      icon="clock-o"
      mainText={mainText}
      onClick={_onSelect}
      onDelete={canDelete ? _onForget : null}
    />
  )
}

/**
 * Renders a list of recent trip requests, most recent first,
 * if permitted by user.
 */
const RecentTrips = ({
  forgetSearch,
  setQueryParam,
  tripRequests = null,
  user
}) =>
  // Note: tripRequests can be undefined,
  // so we have to coerce it to null above to make a valid render.
  user.storeTripHistory &&
  tripRequests &&
  tripRequests.length > 0 && (
    <div className="recent-searches-container">
      <hr />
      <div className="section-header">Recent searches</div>
      <UnpaddedList>
        {tripRequests
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((tripReq) => (
            <TripRequest
              forgetSearch={forgetSearch}
              key={tripReq.id}
              setQueryParam={setQueryParam}
              tripRequest={tripReq}
              user={user}
            />
          ))}
      </UnpaddedList>
    </div>
  )

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { config, currentQuery, location, transitIndex } = state.otp
  const { language, persistence } = config
  const { currentPosition, nearbyStops, sessionSearches } = location
  const { localUser, loggedInUser, loggedInUserTripRequests } = state.user
  return {
    config,
    currentPosition,
    localUser,
    loggedInUser,
    loggedInUserTripRequests,
    nearbyStops,
    persistenceStrategy: getPersistenceStrategy(persistence),
    query: currentQuery,
    sessionSearches,
    stopsIndex: transitIndex.stops,
    storageDisclaimer: language.storageDisclaimer
  }
}

const mapDispatchToProps = {
  deleteLocalUserRecentPlace: userActions.deleteLocalUserRecentPlace,
  deleteLoggedInUserPlace: userActions.deleteLoggedInUserPlace,
  deleteUserPlace: userActions.deleteUserPlace,
  forgetSearch: apiActions.forgetSearch,
  forgetStop: userActions.forgetStop,
  setLocation: mapActions.setLocation,
  setQueryParam: formActions.setQueryParam,
  setViewedStop: uiActions.setViewedStop,
  toggleTracking: apiActions.toggleTracking
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserSettings))
