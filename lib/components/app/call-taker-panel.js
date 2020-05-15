import {
  OTP_API_DATE_FORMAT,
  OTP_API_TIME_FORMAT
} from '@opentripplanner/core-utils/lib/time'
import {hasBike, hasTransit} from '@opentripplanner/core-utils/lib/itinerary'
import {SubmodeSelector} from '@opentripplanner/trip-form'
import * as TripFormClasses from '@opentripplanner/trip-form/lib/styled'
// import isEqual from 'lodash.isequal'
import moment from 'moment'
import React, { Component } from 'react'
import {Button} from 'react-bootstrap'
import { connect } from 'react-redux'
import Select from 'react-select'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
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
      routeOptions: [],
      transitModes: props.modes.transitModes.map(m => m.mode)
    }
  }

  componentWillMount () {
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

  _onClickPlan = () => this.props.routingQuery()

  _setBannedRoutes = options => {
    console.log(options)
    const bannedRoutes = options ? options.map(o => (o.value)).join(',') : ''
    this.props.setQueryParam({ bannedRoutes })
  }

  _setMaxWalkDistance = evt => {
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

  _setPreferredRoutes = options => {
    console.log(options)
    const preferredRoutes = options ? options.map(o => (o.value)).join(',') : ''
    this.props.setQueryParam({ preferredRoutes })
  }

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

  _isBannedRouteOptionDisabled = option => {
    // Disable routes that are preferred already.
    const preferredRoutes = this.getRouteList('preferredRoutes')
    if (preferredRoutes && preferredRoutes.indexOf(option.value) !== -1) return true
    return false
  }
  _isPreferredRouteOptionDisabled = option => {
    // Disable routes that are banned already.
    const bannedRoutes = this.getRouteList('bannedRoutes')
    if (bannedRoutes && bannedRoutes.indexOf(option.value) !== -1) return true
    return false
  }

  handleDateChange = evt => {
    this.props.setQueryParam({ date: evt.target.value })
  }

  handleTimeChange = evt => {
    this.props.setQueryParam({ time: evt.target.value })
  }

  getRouteList = key => {
    const routesParam = this.props.currentQuery[key]
    const idList = routesParam ? routesParam.split(',') : []
    // console.log(routesParam, idList)
    if (this.state.routeOptions) {
      return idList.map(id => this.state.routeOptions.find(o => o.value === id))
    } else {
      return idList.map(id => ({value: id, label: id}))
    }
  }

  render () {
    const {
      activeSearch,
      currentQuery,
      itineraryClass,
      itineraryFooter,
      LegIcon,
      mainPanelContent,
      mobile,
      modes,
      ModeIcon,
      showUserSettings
    } = this.props
    const showPlanTripButton = mainPanelContent === 'EDIT_DATETIME' ||
      mainPanelContent === 'EDIT_SETTINGS'
    // const mostRecentQuery = activeSearch ? activeSearch.query : null
    // const planDisabled = isEqual(currentQuery, mostRecentQuery)
    const {departArrive, date, maxWalkDistance, mode, time} = currentQuery
    const bannedRoutes = this.getRouteList('bannedRoutes')
    const preferredRoutes = this.getRouteList('preferredRoutes')
    console.log(preferredRoutes, bannedRoutes)
    const actionText = mobile ? 'tap' : 'click'
    const leaveNow = departArrive === 'NOW'
    console.log(currentQuery)
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
            <LocationField
              inputPlaceholder={`Enter destination or ${actionText} on map...`}
              locationType='to'
              showClearButton={!mobile}
            />
            <div className='switch-button-container'>
              <SwitchButton content={<i className='fa fa-exchange fa-rotate-90' />} />
            </div>
            <div className='search-options' style={{height: '55px'}}>
              <select
                onBlur={this._setDepartArrive}
                value={departArrive}
                style={{position: 'absolute', left: '10px'}}
                onChange={this._setDepartArrive}>
                {departureOptions.map(o => (
                  <option key={o.value} {...o} />
                ))}
              </select>
              {leaveNow
                ? null
                : <input
                  type='time'
                  value={time}
                  step='900'
                  style={{
                    position: 'absolute',
                    left: '97px',
                    top: '102px'
                  }}
                  required
                  onChange={this.handleTimeChange}
                />
              }
              {leaveNow
                ? null
                : <input
                  type='date'
                  value={date}
                  style={{
                    position: 'absolute',
                    left: '97px',
                    top: '129px',
                    width: '132px'
                  }}
                  required
                  onChange={this.handleDateChange}
                />
              }
              <select
                onBlur={this._setMode}
                value={this.modeToOptionValue(mode)}
                style={{position: 'absolute', right: '60px'}}
                onChange={this._setMode}>
                {modeOptions.map(o => (
                  <option key={o.value} {...o} />
                ))}
              </select>
              <Button
                bsStyle='default'
                bsSize='small'
                onClick={this._onClickPlan}
                style={{position: 'absolute', right: '10px', top: '99px'}} >
                Plan
              </Button>
            </div>
            <div className='advanced-search-options' style={{alignItems: 'center', display: 'flex', justifyContent: 'space-between'}}>
              <input
                onChange={this._setMaxWalkDistance}
                step={metersToMiles(maxWalkDistance) <= 2 ? '.25' : '1'}
                style={{marginRight: '10px', width: '60px'}}
                value={metersToMiles(maxWalkDistance)}
                type='number' />
              <StyledSubmodeSelector
                modes={transitModes}
                onChange={this.onSubModeChange}
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

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const showUserSettings = getShowUserSettings(state.otp)
  return {
    activeSearch: getActiveSearch(state.otp),
    currentQuery: state.otp.currentQuery,
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
