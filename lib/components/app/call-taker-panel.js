import {
  OTP_API_DATE_FORMAT,
  OTP_API_TIME_FORMAT
} from '@opentripplanner/core-utils/lib/time'
import {hasBike, hasTransit} from '@opentripplanner/core-utils/lib/itinerary'
import { storeItem } from '@opentripplanner/core-utils/lib/storage'
import {SubmodeSelector} from '@opentripplanner/trip-form'
import * as TripFormClasses from '@opentripplanner/trip-form/lib/styled'
import isEqual from 'lodash.isequal'
import moment from 'moment'
import React, { Component } from 'react'
import {Button} from 'react-bootstrap'
import { connect } from 'react-redux'
import Select from 'react-select'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import IntermediatePlace from '../form/intermediate-place-field'
import LocationField from '../form/connected-location-field'
import SwitchButton from '../form/switch-button'
import UserSettings from '../form/user-settings'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import ViewerContainer from '../viewers/viewer-container'
import {modeButtonButtonCss} from '../form/styled'

// FIXME: move to styled.js?
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

const departureOptions = [
  {
    // Default option.
    value: 'NOW',
    children: 'Now'
  },
  {
    value: 'DEPART',
    children: 'Depart at'
  },
  {
    value: 'ARRIVE',
    children: 'Arrive by'
  }
]

const modeOptions = [
  {
    // Default option.
    value: 'TRANSIT',
    children: 'Transit'
  },
  {
    value: 'WALK',
    children: 'Walk only'
  },
  {
    value: 'BICYCLE',
    children: 'Bike only'
  },
  {
    value: 'BICYCLE,TRANSIT',
    children: 'Bike to transit'
  }
]

const metersToMiles = meters => Math.round(meters * 0.000621371 * 100) / 100
const milesToMeters = miles => miles / 0.000621371

class CallTakerPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expandAdvanced: props.expandAdvanced,
      transitModes: props.modes.transitModes.map(m => m.mode)
    }
  }

  _planTrip = () => this.props.routingQuery()

  _setBannedRoutes = options => {
    const bannedRoutes = options ? options.map(o => o.value).join(',') : ''
    this.props.setQueryParam({ bannedRoutes })
  }

  _setMaxWalkDistance = evt => {
    console.log(evt.target.value)
    this.props.setQueryParam({ maxWalkDistance: milesToMeters(evt.target.value) })
  }

  onSubModeChange = changedMode => {
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
    this.setState({transitModes})
    // Update all modes in query (set to walk if all transit modes inactive).
    this.props.setQueryParam({ mode: allModes.join(',') || 'WALK' })
  }

  modeToOptionValue = mode => {
    const isTransit = hasTransit(mode)
    const isBike = hasBike(mode)
    if (isTransit && isBike) return 'BICYCLE,TRANSIT'
    else if (isTransit) return 'TRANSIT'
    // Currently handles bicycle
    else return mode
  }

  _addPlace = (result, index) => {
    const intermediatePlaces = [...this.props.currentQuery.intermediatePlaces] || []
    if (result && index !== undefined) {
      // If adding an actual intermediate place with location. Overwrite the
      // placeholder with the new value.
      intermediatePlaces.splice(index, 1, result.location)
    } else {
      // Otherwise, we're just adding a dummy place.
      intermediatePlaces.push({})
    }
    this.props.setQueryParam({intermediatePlaces})
  }

  _removePlace = ({index}) => {
    const intermediatePlaces = [...this.props.currentQuery.intermediatePlaces] || []
    intermediatePlaces.splice(index, 1)
    this.props.setQueryParam({intermediatePlaces})
  }

  _setMode = evt => {
    const {value: mode} = evt.target
    const transitIsSelected = mode.indexOf('TRANSIT') !== -1
    if (transitIsSelected) {
      // Collect transit modes and selected access mode.
      const accessMode = mode === 'TRANSIT' ? 'WALK' : 'BICYCLE'
      // If no transit is selected, selected all available. Otherwise, default
      // to state.
      const transitModes = this.state.transitModes.length > 0
        ? this.state.transitModes
        : this.props.modes.transitModes.map(m => m.mode)
      const newModes = [accessMode, ...transitModes].join(',')
      this.setState({transitModes})
      this.props.setQueryParam({ mode: newModes })
    } else {
      this.props.setQueryParam({ mode })
    }
  }

  _onHideAdvancedClick = () => {
    const expandAdvanced = !this.state.expandAdvanced
    // FIXME move logic to action
    storeItem('expandAdvanced', expandAdvanced)
    this.setState({expandAdvanced})
  }

  /**
   * Key down listener that will submit a plan trip query when Enter is pressed.
   * This listener can be passed to constituent form elements for easy
   * keyboard-only operation of the trip planning form. Note: it generally should
   * not be passed to buttons or other elements that natively rely on the Enter
   * key.
   */
  _handleFormKeyDown = (evt) => {
    switch (evt.keyCode) {
      case 13: // Enter
        evt.preventDefault()
        // Submit routing query.
        this._planTrip()
        break
      default:
        // Do nothing.
        break
    }
  }

  render () {
    const {
      activeSearch,
      callTakerUrl,
      currentQuery,
      itineraryClass,
      itineraryFooter,
      LegIcon,
      mainPanelContent,
      mobile,
      modes,
      ModeIcon,
      routes,
      setQueryParam,
      showUserSettings
    } = this.props
    const showPlanTripButton = mainPanelContent === 'EDIT_DATETIME' ||
      mainPanelContent === 'EDIT_SETTINGS'
    // const mostRecentQuery = activeSearch ? activeSearch.query : null
    // const planDisabled = isEqual(currentQuery, mostRecentQuery)
    const {
      departArrive,
      date,
      intermediatePlaces,
      mode,
      time
    } = currentQuery
    const actionText = mobile ? 'tap' : 'click'
    const {expandAdvanced} = this.state
    return (
      <ViewerContainer>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: showPlanTripButton ? 55 : 0,
          paddingBottom: 15,
          overflow: 'auto',
          margin: '10px'
        }}>
          <div className='form'>
            <LocationField
              inputPlaceholder={`Enter start location or ${actionText} on map...`}
              locationType='from'
              showClearButton
            />
            {Array.isArray(intermediatePlaces) && intermediatePlaces.map((place, i) => {
              return (
                <IntermediatePlace
                  key={i}
                  index={i}
                  location={place}
                  onLocationCleared={this._removePlace}
                  // FIXME: function def
                  onLocationSelected={result => this._addPlace(result, i)}
                  // FIXME: allow intermediate location type.
                  locationType='to'
                  inputPlaceholder={`Enter intermediate destination`}
                  showClearButton={!mobile}
                />
              )
            })}
            <LocationField
              inputPlaceholder={`Enter destination or ${actionText} on map...`}
              locationType='to'
              showClearButton={!mobile}
            />
            <div className='switch-button-container'>
              <SwitchButton content={<i className='fa fa-exchange fa-rotate-90' />} />
            </div>
            <button
              className='clear-button-formatting'
              style={{marginBottom: '5px', marginLeft: '10px'}}
              onClick={this._addPlace}>
              <i className='fa fa-plus-circle' /> Add place
            </button>
            <div className='search-options' style={{height: '30px'}}>
              <DateTimeOptions
                date={date}
                onKeyDown={this._handleFormKeyDown}
                departArrive={departArrive}
                setQueryParam={setQueryParam}
                time={time} />
              <select
                onBlur={this._setMode}
                onKeyDown={this._handleFormKeyDown}
                value={this.modeToOptionValue(mode)}
                style={{position: 'absolute', right: '50px'}}
                onChange={this._setMode}>
                {modeOptions.map(o => (
                  <option key={o.value} {...o} />
                ))}
              </select>
              <Button
                bsStyle='default'
                bsSize='small'
                onClick={this._planTrip}
                style={{
                  position: 'absolute',
                  right: '0px'
                }} >
                Plan
              </Button>
            </div>
            <div className='advanced-search-options-container'>
              <Button
                className='hide-button clear-button-formatting'
                onClick={this._onHideAdvancedClick}>
                <i className={`fa fa-caret-${expandAdvanced ? 'up' : 'down'}`} /> Advanced options
              </Button>
              <div className='advanced-search-options' style={!expandAdvanced ? {display: 'none'} : null}>
                {callTakerUrl
                  ? <CallTakerOptions
                    modes={modes}
                    ModeIcon={ModeIcon}
                    routes={routes}
                    findRoutes={this.props.findRoutes}
                    setQueryParam={setQueryParam}
                    currentQuery={currentQuery} />
                  : null
                }
              </div>
            </div>
          </div>
          {!activeSearch && !showPlanTripButton && showUserSettings &&
            <UserSettings />
          }
          <div className='desktop-narrative-container'>
            <NarrativeItineraries
              itineraryClass={itineraryClass}
              itineraryFooter={itineraryFooter}
              LegIcon={LegIcon}
            />
          </div>
        </div>
        {showPlanTripButton &&
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 10,
              bottom: 55,
              height: 15
            }}
            className='white-fade' />
        }
      </ViewerContainer>
    )
  }
}

class CallTakerOptions extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expandAdvanced: props.expandAdvanced,
      routeOptions: [],
      transitModes: props.modes.transitModes.map(m => m.mode)
    }
  }

  componentWillMount () {
    // Fetch routes for banned/preferred routes selectors.
    this.props.findRoutes()
  }

  componentWillReceiveProps (nextProps) {
    const {routes} = nextProps
    // Once routes are available, map them to the route options format.
    if (routes && !this.props.routes) {
      console.log(routes)
      const routeOptions = Object.values(routes).map(this.routeToOption)
      this.setState({routeOptions})
    }
  }

  _setPreferredRoutes = options => {
    const preferredRoutes = options ? options.map(o => (o.value)).join(',') : ''
    this.props.setQueryParam({ preferredRoutes })
  }

  _isBannedRouteOptionDisabled = option => {
    // Disable routes that are preferred already.
    const preferredRoutes = this.getRouteList('preferredRoutes')
    return preferredRoutes && preferredRoutes.find(o => o.value === option.value)
  }

  _isPreferredRouteOptionDisabled = option => {
    // Disable routes that are banned already.
    const bannedRoutes = this.getRouteList('bannedRoutes')
    return bannedRoutes && bannedRoutes.find(o => o.value === option.value)
  }

  getDistanceStep = distanceInMeters => {
    // Determine step for max walk/bike based on current value. Increment by a
    // quarter mile if dealing with small values, whatever number will round off
    // the number if it is not an integer, or default to one mile.
    return metersToMiles(distanceInMeters) <= 2
      ? '.25'
      : metersToMiles(distanceInMeters) % 1 !== 0
        ? `${metersToMiles(distanceInMeters) % 1}`
        : '1'
  }

  /**
   * Get list of routes for specified key (either 'bannedRoutes' or
   * 'preferredRoutes').
   */
  getRouteList = key => {
    const routesParam = this.props.currentQuery[key]
    const idList = routesParam ? routesParam.split(',') : []
    if (this.state.routeOptions) {
      return this.state.routeOptions.filter(o => idList.indexOf(o.value) !== -1)
    } else {
      // If route list is not available, default labels to route IDs.
      return idList.map(id => ({value: id, label: id}))
    }
  }

  routeToOption = route => {
    if (!route) return null
    const {id, longName, shortName} = route
    // For some reason the OTP API expects route IDs in this double
    // underscore format
    // FIXME: This replace is flimsy! What if there are more colons?
    const value = id.replace(':', '__')
    const label = shortName
      ? `${shortName}${longName ? ` - ${longName}` : ''}`
      : longName
    return {value, label}
  }

  render () {
    const {currentQuery, modes, ModeIcon} = this.props
    const {maxBikeDistance, maxWalkDistance, mode} = currentQuery
    const bannedRoutes = this.getRouteList('bannedRoutes')
    const preferredRoutes = this.getRouteList('preferredRoutes')
    const transitModes = modes.transitModes.map(modeObj => {
      const modeStr = modeObj.mode || modeObj
      return {
        id: modeStr,
        selected: this.state.transitModes.indexOf(modeStr) !== -1,
        text: (
          <span>
            <ModeIcon mode={modeStr} />
          </span>
        ),
        title: modeObj.label
      }
    })
    return (
      <>
        <div style={{alignItems: 'center', display: 'flex', justifyContent: 'space-between'}}>
          <label style={{fontWeight: '400'}}>
            Max walk
            <input
              onChange={this._setMaxWalkDistance}
              onKeyDown={this._handleFormKeyDown}
              step={this.getDistanceStep(maxWalkDistance)}
              min='0'
              style={{display: 'block', marginRight: '10px', width: '60px'}}
              value={metersToMiles(maxWalkDistance)}
              type='number' />
          </label>
          {hasBike(mode)
            ? <label style={{fontWeight: '400'}}>
              Max bike
              <input
                onChange={this._setMaxBikeDistance}
                onKeyDown={this._handleFormKeyDown}
                step={this.getDistanceStep(maxBikeDistance)}
                min='0'
                style={{display: 'block', marginRight: '10px', width: '60px'}}
                value={metersToMiles(maxBikeDistance)}
                type='number' />
            </label>
            : null
          }
          <StyledSubmodeSelector
            modes={transitModes}
            onChange={this.onSubModeChange}
            // FIXME: Need to pass onKeyDown to children buttons in
            // otp-ui.
            onKeyDown={this._handleFormKeyDown}
          />
        </div>
        <Select
          value={bannedRoutes}
          id='bannedRoutes'
          isMulti
          isOptionDisabled={this._isBannedRouteOptionDisabled}
          options={this.state.routeOptions}
          onChange={this._setBannedRoutes}
          placeholder='Select banned routes...' />
        <Select
          value={preferredRoutes}
          id='preferredRoutes'
          isMulti
          isOptionDisabled={this._isPreferredRouteOptionDisabled}
          options={this.state.routeOptions}
          onChange={this._setPreferredRoutes}
          placeholder='Select preferred routes...' />
      </>
    )
  }
}

class DateTimeOptions extends Component {
  _setDepartArrive = evt => {
    const {value: departArrive} = evt.target
    if (departArrive === 'NOW') {
      this.props.setQueryParam({
        departArrive,
        date: moment().format(OTP_API_DATE_FORMAT),
        time: moment().format(OTP_API_TIME_FORMAT)
      })
    } else {
      this.props.setQueryParam({ departArrive })
    }
  }

  handleDateChange = evt => {
    this.props.setQueryParam({ date: evt.target.value })
  }

  handleTimeChange = evt => {
    this.props.setQueryParam({ time: evt.target.value })
  }

  render () {
    const {date, departArrive, time} = this.props
    const leaveNow = departArrive === 'NOW'
    return (
      <>
        <select
          onBlur={this._setDepartArrive}
          onKeyDown={this.props.onKeyDown}
          value={departArrive}
          style={{position: 'absolute', left: '0px'}}
          onChange={this._setDepartArrive}>
          {departureOptions.map(o => (
            <option key={o.value} {...o} />
          ))}
        </select>
        {leaveNow
          ? null
          : <input
            onKeyDown={this.props.onKeyDown}
            type='time'
            value={time}
            step='900'
            style={{
              position: 'absolute',
              left: '90px',
              border: 'none',
              outline: 'none',
              width: '96px'
            }}
            required
            onChange={this.handleTimeChange}
          />
        }
        {leaveNow
          ? null
          : <input
            onKeyDown={this.props.onKeyDown}
            type='date'
            value={date}
            style={{
              position: 'absolute',
              left: '180px',
              width: '124px',
              border: 'none',
              outline: 'none'
            }}
            required
            onChange={this.handleDateChange}
          />
        }
      </>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const showUserSettings = getShowUserSettings(state.otp)
  return {
    activeSearch: getActiveSearch(state.otp),
    callTakerUrl: state.otp.config.callTakerUrl,
    currentQuery: state.otp.currentQuery,
    expandAdvanced: state.otp.user.expandAdvanced,
    mainPanelContent: state.otp.ui.mainPanelContent,
    modes: state.otp.config.modes,
    routes: state.otp.transitIndex.routes,
    showUserSettings
  }
}

const mapDispatchToProps = {
  findRoutes: apiActions.findRoutes,
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(CallTakerPanel)
