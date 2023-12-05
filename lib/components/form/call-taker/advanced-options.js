/* eslint-disable react/prop-types */
// FIXME: Remove the following eslint rule exception.
/* eslint-disable jsx-a11y/label-has-for */
import * as TripFormClasses from '@opentripplanner/trip-form/lib/styled'
import {
  DropdownSelector,
  SliderSelector,
  SubmodeSelector
} from '@opentripplanner/trip-form'
import { FormattedMessage, injectIntl } from 'react-intl'
import { hasBike } from '@opentripplanner/core-utils/lib/itinerary'
import isEmpty from 'lodash.isempty'
import React, { Component, lazy, Suspense } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import { modeButtonButtonCss } from '../styled'

export const StyledSubmodeSelector = styled(SubmodeSelector)`
  ${TripFormClasses.SubmodeSelector.Row} {
    > * {
      padding: 3px 5px 3px 0px;
    }
    > :last-child {
      padding-right: 0px;
    }
    ${TripFormClasses.ModeButton.Button} {
      padding: 6px 12px;
    }
    svg,
    img {
      margin-left: 0px;
    }
  }
  ${TripFormClasses.SubmodeSelector.InlineRow} {
    margin: -3px 0px;
  }

  ${TripFormClasses.SubmodeSelector} {
    ${modeButtonButtonCss}
  }

  margin: 5px 0;
`

const metersToMiles = (meters) => Math.round(meters * 0.000621371 * 100) / 100
const milesToMeters = (miles) => miles / 0.000621371

/**
 * Converts a new TransportMode object to legacy style underscore qualifier
 */
const convertModeObjectToString = (m) => {
  return `${m.mode}${m.qualifier ? `_${m.qualifier}` : ''}`
}

/**
 * Converts a legacy mode string with underscore qualifier to TransportMode object
 * Falls back to WALK mode.
 */
const convertStringToModeObject = (m) => {
  return m.split('_')
    ? { mode: m.split('_')[0], qualifier: m.split('_')[1] }
    : { mode: 'WALK' }
}

class AdvancedOptions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expandAdvanced: props.expandAdvanced,
      routeOptions: [],
      transitModes: props.modes.transitModes.map((m) => m.mode)
    }
  }

  static contextType = ComponentContext

  componentDidMount() {
    // Fetch routes for banned/preferred routes selectors.
    this.props.findRoutesIfNeeded()
  }

  componentDidUpdate(prevProps) {
    const { routes } = this.props
    // Once routes are available, map them to the route options format.
    if (!isEmpty(routes) && isEmpty(prevProps.routes)) {
      const routeOptions = Object.values(routes).map(this.routeToOption)
      this.setState({ routeOptions })
    }
  }

  _setBannedRoutes = (options) => {
    const bannedRoutes = options ? options.map((o) => o.value).join(',') : ''
    this.props.setQueryParam({ banned: { routes: bannedRoutes } })
  }

  _setPreferredRoutes = (options) => {
    const preferredRoutes = options ? options.map((o) => o.value).join(',') : ''
    this.props.setQueryParam({ preferred: { routes: preferredRoutes } })
  }

  _isBannedRouteOptionDisabled = (option) => {
    // Disable routes that are preferred already.
    const preferredRoutes = this.getRouteList('preferred')
    return (
      preferredRoutes && preferredRoutes.find((o) => o.value === option.value)
    )
  }

  _isPreferredRouteOptionDisabled = (option) => {
    // Disable routes that are banned already.
    const bannedRoutes = this.getRouteList('banned')
    return bannedRoutes && bannedRoutes.find((o) => o.value === option.value)
  }

  getDistanceStep = (distanceInMeters) => {
    // Determine step for max walk/bike based on current value. Increment by a
    // quarter mile if dealing with small values, whatever number will round off
    // the number if it is not an integer, or default to one mile.
    return metersToMiles(distanceInMeters) <= 2
      ? '.25'
      : metersToMiles(distanceInMeters) % 1 !== 0
      ? `${metersToMiles(distanceInMeters) % 1}`
      : '1'
  }

  _onSubModeChange = (changedMode) => {
    // Get previous transit modes from state and all modes from query.
    const transitModes = [...this.state.transitModes]
    const allModes = this.props.currentQuery?.modes
      ?.map(convertModeObjectToString)
      .map((m) => {
        if (m === 'TRANSIT') {
          return transitModes
        }
        return m
      })
      .flat()
    const index = transitModes.indexOf(changedMode)
    if (index === -1) {
      // If submode was not selected, add it.
      transitModes.push(changedMode)
      allModes.push(changedMode)
    } else {
      // Otherwise, remove it.
      transitModes.splice(index, 1)
      const i = allModes.indexOf(changedMode)
      allModes.splice(i, 1)
    }
    // Update transit modes in state.
    this.setState({ transitModes })
    // Update all modes in query (set to walk if all transit modes inactive).
    this.props.setQueryParam({
      modes: allModes.map(convertStringToModeObject) || { mode: 'WALK' }
    })
  }

  _setMaxWalkDistance = (evt) => {
    this.props.setQueryParam({
      maxWalkDistance: milesToMeters(evt.target.value)
    })
  }

  _setWalkTolerance = ({ walkReluctance }) => {
    this.props.setUrlSearch({
      walkReluctance
    })
  }

  _setBikeReluctance = ({ bikeReluctance }) => {
    this.props.setUrlSearch({
      bikeReluctance
    })
  }

  /**
   * Get list of routes for specified key (either 'bannedRoutes' or
   * 'preferredRoutes').
   */
  getRouteList = (key) => {
    const routesParam = this.props.currentQuery[key]?.routes
    const idList = routesParam ? routesParam.split(',') : []
    if (this.state.routeOptions) {
      return this.state.routeOptions.filter(
        (o) => idList.indexOf(o.value) !== -1
      )
    } else {
      // If route list is not available, default labels to route IDs.
      return idList.map((id) => ({ label: id, value: id }))
    }
  }

  routeToOption = (route) => {
    if (!route) return null
    const { id, longName, shortName } = route
    // For some reason the OTP API expects route IDs in this double
    // underscore format
    // FIXME: This replace is flimsy! What if there are more colons?
    const value = id || ''
    const label = shortName
      ? `${shortName}${longName ? ` - ${longName}` : ''}`
      : longName
    return { label, value }
  }

  render() {
    const { currentQuery, intl, modes, onKeyDown } = this.props
    const { ModeIcon } = this.context

    const Select = lazy(() => import('react-select'))

    const { modes: currentModes } = currentQuery
    const bannedRoutes = this.getRouteList('banned')
    const preferredRoutes = this.getRouteList('preferred')
    const transitModes = modes.transitModes.map((modeObj) => {
      const modeStr = modeObj.mode || modeObj
      return {
        id: modeStr,
        selected: this.state.transitModes.indexOf(modeStr) !== -1,
        text: <ModeIcon mode={modeStr} />,
        title: modeObj.label
      }
    })
    const bikeEnabled = hasBike(
      currentModes?.map((m) => m.mode).join(',') || ''
    )
    const bikeString = bikeEnabled ? 'Biking' : 'Walking'
    return (
      <div>
        <div
          style={{
            alignItems: 'baseline',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <DropdownSelector
            label={
              bikeEnabled
                ? intl.formatMessage({
                    id: 'components.AdvancedOptions.bikeTolerance'
                  })
                : intl.formatMessage({
                    id: 'components.AdvancedOptions.walkTolerance'
                  })
            }
            name={bikeEnabled ? 'bikeReluctance' : 'walkReluctance'}
            onChange={
              bikeEnabled ? this._setBikeReluctance : this._setWalkTolerance
            }
            options={[
              { text: `Normal ${bikeString}`, value: 3 },
              { text: `Avoid ${bikeString}`, value: 15 },
              { text: `Prefer ${bikeString}`, value: 1 }
            ]}
            style={{ display: 'block', width: '33ch' }}
            value={
              bikeEnabled
                ? this.props.modeSettingValues.bikeReluctance
                : this.props.modeSettingValues.walkReluctance
            }
          />

          <StyledSubmodeSelector
            modes={transitModes}
            onChange={this._onSubModeChange}
            // FIXME: Need to pass onKeyDown to children buttons in
            // otp-ui.
            onKeyDown={onKeyDown}
          />
        </div>
        <Suspense fallback={<span>...</span>}>
          <Select
            id="preferredRoutes"
            isMulti
            isOptionDisabled={this._isPreferredRouteOptionDisabled}
            onChange={this._setPreferredRoutes}
            options={this.state.routeOptions}
            placeholder={intl.formatMessage({
              id: 'components.AdvancedOptions.preferredRoutes'
            })}
            value={preferredRoutes}
          />
          <Select
            id="bannedRoutes"
            isMulti
            isOptionDisabled={this._isBannedRouteOptionDisabled}
            onChange={this._setBannedRoutes}
            options={this.state.routeOptions}
            placeholder={intl.formatMessage({
              id: 'components.AdvancedOptions.bannedRoutes'
            })}
            value={bannedRoutes}
          />
        </Suspense>
      </div>
    )
  }
}

export default injectIntl(AdvancedOptions)
