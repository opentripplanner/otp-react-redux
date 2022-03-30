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
import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import { getFormattedPlaces } from '../../util/i18n'
import {
  getPlaceDetail,
  getPlaceMainText,
  isHome,
  isOtpMiddleware,
  isWork
} from '../../util/user'
import { LinkWithQuery } from '../form/connected-links'
import { StyledMainPanelPlace } from '../user/places/styled'
import PlaceShortcut from '../user/places/place-shortcut'

import { UnpaddedList } from './styled'

const { matchLatLon } = coreUtils.map
const { hasTransit, toSentenceCase } = coreUtils.itinerary
/**
 * Version of summarizeQuery and helper function that supports i18n.
 * FIXME: replace when the original does support i18n.
 */
function findLocationType(
  intl,
  location,
  locations = [],
  types = ['home', 'work', 'suggested']
) {
  const match = locations.find((l) => matchLatLon(l, location))
  return match && types.indexOf(match.type) !== -1
    ? getFormattedPlaces(match.type, intl)
    : null
}
export function summarizeQuery(query, intl, locations = []) {
  if (!query.from.name) {
    query.from.name = intl.formatMessage(
      { id: 'common.coordinates' },
      {
        lat: query.from.lat.toFixed(5),
        lon: query.from.lon.toFixed(5)
      }
    )
  }
  if (!query.to.name) {
    query.to.name = intl.formatMessage(
      { id: 'common.coordinates' },
      {
        lat: query.to.lat.toFixed(5),
        lon: query.to.lon.toFixed(5)
      }
    )
  }

  const from =
    findLocationType(intl, query.from, locations) ||
    query.from.name.split(',')[0]
  const to =
    findLocationType(intl, query.to, locations) || query.to.name.split(',')[0]
  const mode = hasTransit(query.mode)
    ? intl.formatMessage({ id: 'common.modes.transit' })
    : toSentenceCase(query.mode)
  return intl.formatMessage(
    { id: 'components.UserSettings.recentSearchSummary' },
    { from, mode, to }
  )
}

/**
 * Formats elapsed time from the specified timestamp to now,
 * as in "5 hours ago" or the localized equivalent.
 */
function formatElapsedTime(timestamp, intl) {
  // This text will be shown in a tooltip, therefore
  // it is obtained using formaMessage rather than <FormattedfMessage>.
  const fromNowDur = moment.duration(moment().diff(moment(timestamp)))
  return intl
    .formatMessage(
      { id: 'common.time.fromNowUpdate' },
      {
        days: fromNowDur.days(),
        hours: fromNowDur.hours(),
        minutes: fromNowDur.minutes()
      }
    )
    .trim()
}

class UserSettings extends Component {
  _disableTracking = () => {
    const { intl, localUser, toggleTracking } = this.props
    const { recentPlaces, recentSearches, storeTripHistory } = localUser
    if (!storeTripHistory) return
    const hasRecents = recentPlaces?.length > 0 || recentSearches?.length > 0

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
      intl,
      localUser,
      setQueryParam,
      setViewedStop
    } = this.props

    const { favoriteStops, recentPlaces, recentSearches, storeTripHistory } =
      localUser
    return (
      <>
        {/* Favorite stops are shown regardless of tracking. */}
        <Places
          getDetailText={(location) => {
            return intl.formatMessage(
              { id: 'components.UserSettings.stopId' },
              { stopId: location.id }
            )
          }}
          getMainText={(location) => location.address}
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
            getDetailText={(location) => {
              return formatElapsedTime(location.timestamp, intl)
            }}
            getMainText={(location) => location.address}
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
        address: '',
        icon: 'briefcase',
        id: 'work',
        type: 'work'
      })
    }
    if (!locations.find(isHome)) {
      locations.push({
        address: '',
        icon: 'home',
        id: 'home',
        type: 'home'
      })
    }
    return locations
  }

  _deleteUserPlace = (place) => {
    const { deleteUserPlace, intl } = this.props
    deleteUserPlace(place, intl)
  }

  render() {
    const {
      className = '',
      forgetSearch,
      intl,
      isUsingOtpMiddleware,
      localUser,
      loggedInUser,
      loggedInUserTripRequests,
      setQueryParam,
      style
    } = this.props
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
          getDetailText={(location) => getPlaceDetail(location, intl)}
          getMainText={(location) => getPlaceMainText(location, intl)}
          header={
            isUsingOtpMiddleware && (
              <FormattedMessage
                id="components.UserSettings.mySavedPlaces"
                values={{
                  manageLink: (linkText) => (
                    <LinkWithQuery to="/account/settings">
                      {linkText}
                    </LinkWithQuery>
                  )
                }}
              />
            )
          }
          onDelete={this._deleteUserPlace}
          places={sortedLocations}
          separator={false}
        />
        {isUsingOtpMiddleware ? (
          <RecentTrips
            forgetSearch={forgetSearch}
            setQueryParam={setQueryParam}
            tripRequests={loggedInUserTripRequests}
            user={loggedInUser}
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

  const intl = useIntl()
  const mainText = summarizeQuery(query, intl, user.savedLocations).trim()
  return (
    <StyledMainPanelPlace
      className="place-item"
      detailText={formatElapsedTime(timestamp, intl)}
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
      <div className="section-header">
        <FormattedMessage id="components.UserSettings.recentSearches" />
      </div>
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

const mapStateToProps = (state) => {
  const { config, currentQuery } = state.otp
  const { localUser, loggedInUser, loggedInUserTripRequests } = state.user
  return {
    isUsingOtpMiddleware: isOtpMiddleware(config.persistence),
    localUser,
    loggedInUser,
    loggedInUserTripRequests,
    query: currentQuery
  }
}

const mapDispatchToProps = {
  deleteLocalUserRecentPlace: userActions.deleteLocalUserRecentPlace,
  deleteUserPlace: userActions.deleteUserPlace,
  forgetSearch: apiActions.forgetSearch,
  forgetStop: userActions.forgetStop,
  setQueryParam: formActions.setQueryParam,
  setViewedStop: uiActions.setViewedStop,
  toggleTracking: apiActions.toggleTracking
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserSettings))
