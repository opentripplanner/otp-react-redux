/* eslint-disable react/prop-types */
// FIXME: Remove the following eslint rule exception.
/* eslint-disable jsx-a11y/label-has-for */
import * as TripFormClasses from '@opentripplanner/trip-form/lib/styled'
import { FormattedMessage, injectIntl } from 'react-intl'
import { hasBike } from '@opentripplanner/core-utils/lib/itinerary'
import { SliderSelector, SubmodeSelector } from '@opentripplanner/trip-form'
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
`

const metersToMiles = (meters) => Math.round(meters * 0.000621371 * 100) / 100
const milesToMeters = (miles) => miles / 0.000621371

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
    this.props.setQueryParam({ bannedRoutes })
  }

  _setPreferredRoutes = (options) => {
    const preferredRoutes = options ? options.map((o) => o.value).join(',') : ''
    this.props.setQueryParam({ preferredRoutes })
  }

  _isBannedRouteOptionDisabled = (option) => {
    // Disable routes that are preferred already.
    const preferredRoutes = this.getRouteList('preferredRoutes')
    return (
      preferredRoutes && preferredRoutes.find((o) => o.value === option.value)
    )
  }

  _isPreferredRouteOptionDisabled = (option) => {
    // Disable routes that are banned already.
    const bannedRoutes = this.getRouteList('bannedRoutes')
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
    const allModes = this.props.currentQuery.mode.split(',')
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
    this.props.setQueryParam({ mode: allModes.join(',') || 'WALK' })
  }

  _setMaxWalkDistance = (evt) => {
    this.props.setQueryParam({
      maxWalkDistance: milesToMeters(evt.target.value)
    })
  }

  _setWalkReluctance = ({ walkReluctance }) => {
    this.props.setQueryParam({
      walkReluctance
    })
  }

  /**
   * Get list of routes for specified key (either 'bannedRoutes' or
   * 'preferredRoutes').
   */
  getRouteList = (key) => {
    const routesParam = this.props.currentQuery[key]
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
    const value = id ? id.replace(':', '__') : ''
    const label = shortName
      ? `${shortName}${longName ? ` - ${longName}` : ''}`
      : longName
    return { label, value }
  }

  render() {
    const { currentQuery, intl, modes, onKeyDown, usingOtp2 } = this.props
    const { ModeIcon } = this.context

    const Select = lazy(() => import('react-select'))

    const { maxBikeDistance, maxWalkDistance, mode, walkReluctance } =
      currentQuery
    const bannedRoutes = this.getRouteList('bannedRoutes')
    const preferredRoutes = this.getRouteList('preferredRoutes')
    const transitModes = modes.transitModes.map((modeObj) => {
      const modeStr = modeObj.mode || modeObj
      return {
        id: modeStr,
        selected: this.state.transitModes.indexOf(modeStr) !== -1,
        text: <ModeIcon mode={modeStr} />,
        title: modeObj.label
      }
    })
    // FIXME: Set units via config.
    const unitsString = '(mi.)'
    return (
      <div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          {usingOtp2 ? (
            <SliderSelector
              label={intl.formatMessage({
                id: 'components.AdvancedOptions.walkReluctance'
              })}
              name="walkReluctance"
              onChange={this._setWalkReluctance}
              style={{ display: 'block', marginRight: '10px', width: '150px' }}
              value={walkReluctance}
            />
          ) : (
            <label style={{ fontWeight: '400' }}>
              <FormattedMessage
                id="components.AdvancedOptions.maxWalk"
                values={{ unitsString }}
              />
              <input
                min="0"
                onChange={this._setMaxWalkDistance}
                onKeyDown={onKeyDown}
                step={this.getDistanceStep(maxWalkDistance)}
                style={{ display: 'block', marginRight: '10px', width: '60px' }}
                type="number"
                value={metersToMiles(maxWalkDistance)}
              />
            </label>
          )}
          {hasBike(mode) ? (
            <label style={{ fontWeight: '400' }}>
              <FormattedMessage
                id="components.AdvancedOptions.maxBike"
                values={{ unitsString }}
              />
              <input
                min="0"
                onChange={this._setMaxBikeDistance}
                onKeyDown={onKeyDown}
                step={this.getDistanceStep(maxBikeDistance)}
                style={{ display: 'block', marginRight: '10px', width: '60px' }}
                type="number"
                value={metersToMiles(maxBikeDistance)}
              />
            </label>
          ) : null}
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
