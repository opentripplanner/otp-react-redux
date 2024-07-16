/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { differenceInSeconds } from 'date-fns'
import { FormattedMessage, injectIntl, useIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component, useCallback } from 'react'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import * as uiActions from '../../actions/ui'
import * as userActions from '../../actions/user'
import {
  getPlaceDetail,
  getPlaceMainText,
  isOtpMiddleware
} from '../../util/user'
import { StyledMainPanelPlace } from '../user/places/styled'
import Link from '../util/link'
import PlaceShortcut from '../user/places/place-shortcut'

import { summarizeQuery } from './user-settings-i18n'
import { UnpaddedList } from './styled'

const { toHoursMinutesSeconds } = coreUtils.time

/**
 * Formats elapsed time from the specified timestamp to now,
 * as in "5 hours ago" or the localized equivalent.
 */
function formatElapsedTime(timestamp, intl) {
  const ellapsedSeconds = differenceInSeconds(new Date(), new Date(timestamp))
  const { hours: allHours, minutes } = toHoursMinutesSeconds(ellapsedSeconds)
  // TODO: add a day component to OTP-UI's toHoursMinutesSeconds?
  const hours = allHours % 24
  const days = (allHours - hours) / 24

  // This text can be shown in a tooltip as well as within HTML tags, therefore
  // it is obtained using formatMessage rather than <FormattedfMessage>.
  let duration
  if (days !== 0) {
    duration = intl.formatMessage(
      { id: 'common.time.duration.nDays' },
      { days }
    )
  } else if (hours !== 0) {
    duration = intl.formatMessage(
      { id: 'common.time.duration.nHours' },
      { hours }
    )
  } else if (minutes !== 0) {
    duration = intl.formatMessage(
      { id: 'common.time.duration.nMinutes' },
      { minutes }
    )
  } else {
    duration = intl.formatMessage({
      id: 'common.time.duration.aFewSeconds'
    })
  }

  return intl.formatMessage({ id: 'common.time.durationAgo' }, { duration })
}

/**
 * Helper to ensure the home and work locations are correctly populated,
 * or a placeholder is created.
 */
function addOrEditPlaceIfNeeded(locations, type, icon) {
  const editedLocation = locations.find((loc) => loc.type === type)
  if (editedLocation) {
    // Define the address field, if not already set, so that the place appears as non-blank in the main pane
    // (i.e. so that the address is shown instead of "Set your home/work location").
    if (!editedLocation.address) editedLocation.address = editedLocation.name
  } else {
    locations.push({
      address: '',
      icon,
      id: type,
      type
    })
  }
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
      setUrlSearch,
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
            setUrlSearch={setUrlSearch}
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
    addOrEditPlaceIfNeeded(locations, 'home', 'home')
    addOrEditPlaceIfNeeded(locations, 'work', 'briefcase')
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
                    <span className="manage-link">
                      <Link to="/account/settings">{linkText}</Link>
                    </span>
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
const TripRequest = ({
  forgetSearch,
  setQueryParam,
  setUrlSearch,
  tripRequest,
  user
}) => {
  const { canDelete = true, id, query, timestamp } = tripRequest

  const _onSelect = useCallback(
    // Update query params and initiate search.
    () => {
      setQueryParam(query, id)
      if (query.modeButtons) {
        setUrlSearch({ modeButtons: query.modeButtons })
      }
      if (query.modeSettings) {
        setUrlSearch({ modeSettings: query.modeSettings })
      }
    },
    [setQueryParam, setUrlSearch, query, id]
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
  setUrlSearch,
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
              setUrlSearch={setUrlSearch}
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
  setUrlSearch: apiActions.setUrlSearch,
  setViewedStop: uiActions.setViewedStop,
  toggleTracking: apiActions.toggleTracking
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserSettings))
