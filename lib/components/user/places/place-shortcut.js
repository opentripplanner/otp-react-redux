import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import { PERSIST_TO_OTP_MIDDLEWARE } from '../../../util/constants'
import { convertToLocation, getPersistenceStrategy } from '../../../util/user'

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
  _setFromOrToLocation = location => {
    const { query, setLocation } = this.props
    // If 'to' not set and 'from' does not match location, set as 'to'.
    if (
      !query.to && (
        !query.from || !matchLatLon(location, query.from)
      )
    ) {
      setLocation({ location, locationType: 'to' })
    } else if (
      // Vice versa for setting as 'from'.
      !query.from &&
        !matchLatLon(location, query.to)
    ) {
      setLocation({ location, locationType: 'from' })
    }
  }

  _onSelect = () => {
    const { index, persistenceStrategy, place, routeTo } = this.props
    if (place.blank) {
      if (persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE) {
        routeTo(`/account/places/${index}`)
      } else {
        window.alert(`Enter origin/destination in the form (or set via map click) and click the resulting marker to set as ${place.type} location.`)
      }
    } else {
      // Convert to OTP UI location before sending events
      // (to avoid issues when user clicks Forget/Save location
      // multiple times subsequently)
      this._setFromOrToLocation(convertToLocation(place))
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

  render () {
    const { detailText, icon, mainText, onView, place, title } = this.props
    return (
      <StyledMainPanelPlace
        className='place-item'
        detailText={detailText}
        icon={icon}
        mainText={mainText}
        onClick={this._onSelect}
        onDelete={!place.isFixed && !place.blank ? this._onDelete : null}
        onView={onView && this._onView}
        title={title}
      />
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { config, currentQuery: query } = state.otp
  const { persistence } = config
  return {
    persistenceStrategy: getPersistenceStrategy(persistence),
    query
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo,
  setLocation: mapActions.setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceShortcut)
