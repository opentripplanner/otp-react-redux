/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'

import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import { convertToLegacyLocation, getPersistenceMode } from '../../../util/user'
import { getFormattedPlaces } from '../../../util/i18n'
import { isBlank } from '../../../util/ui'

import { StyledMainPanelPlace } from './styled'

const { matchLatLon } = coreUtils.map

/**
 * A shortcut button that wraps the provided PlaceComponent and sets
 * the provided place as the 'from' or 'to' place.
 */
class PlaceShortcut extends Component {
  /**
   * Sets the from or to location based on the query using the provided action.
   */
  _setFromOrToLocation = (location) => {
    const { query, setLocation } = this.props
    // If 'to' not set and 'from' does not match location, set as 'to'.
    if (!query.to && (!query.from || !matchLatLon(location, query.from))) {
      setLocation({ location, locationType: 'to', reverseGeocode: false })
    } else if (
      // Vice versa for setting as 'from'.
      !query.from &&
      !matchLatLon(location, query.to)
    ) {
      setLocation({ location, locationType: 'from', reverseGeocode: false })
    }
  }

  _onSelect = () => {
    const { index, intl, persistenceMode, place, routeTo } = this.props
    if (isBlank(place.address)) {
      if (persistenceMode.isOtpMiddleware) {
        routeTo(`/account/places/${index}`)
      } else if (persistenceMode.isLocalStorage) {
        window.alert(
          intl.formatMessage(
            { id: 'components.Place.enterAlert' },
            { type: getFormattedPlaces(place.type, intl) }
          )
        )
      }
    } else {
      // Convert to OTP UI location before sending events
      // (to avoid issues when user clicks Forget/Save location
      // multiple times subsequently)
      this._setFromOrToLocation(convertToLegacyLocation(place))
    }
  }

  _onView = () => {
    const { onView, place } = this.props
    onView({ stopId: place.id })
  }

  _onDelete = () => {
    const { onDelete, place } = this.props
    onDelete(place)
  }

  render() {
    const { detailText, icon, mainText, onView, place } = this.props
    return (
      <StyledMainPanelPlace
        className="place-item"
        detailText={detailText}
        icon={icon}
        mainText={mainText}
        onClick={this._onSelect}
        onDelete={!isBlank(place.address) ? this._onDelete : null}
        onView={onView && this._onView}
      />
    )
  }
}

// connect to redux store

const mapStateToProps = (state) => {
  const { config, currentQuery: query } = state.otp
  const { persistence } = config
  return {
    persistenceMode: getPersistenceMode(persistence),
    query
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo,
  setLocation: mapActions.setLocation
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PlaceShortcut))
