// TODO: Typescript once common types exist
/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import { storeItem } from '@opentripplanner/core-utils/lib/storage'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as formActions from '../../actions/form'
import {
  getActiveSearch,
  getShowUserSettings,
  hasValidLocation
} from '../../util/state'
import { getGroupSize } from '../../util/call-taker'
import AddPlaceButton from '../form/add-place-button'
import AdvancedOptions from '../form/call-taker/advanced-options'
import DateTimeOptions from '../form/call-taker/date-time-options'
import IntermediatePlace from '../form/intermediate-place-field'
import LocationField from '../form/connected-location-field'
import ModeDropdown from '../form/call-taker/mode-dropdown'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import SwitchButton from '../form/switch-button'
import UserSettings from '../form/user-settings'
import ViewerContainer from '../viewers/viewer-container'

const InputWithSpace = styled.input`
  &::before {
    margin: 0 0.125em;
  }
`

/**
 * This is the main panel/sidebar for the Call Taker/Field Trip module. It
 * currently also serves as the main panel for the FDOT RMCE trip comparison view
 * which depends on the BATCH trip planning mode.
 */
class CallTakerPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expandAdvanced: props.expandAdvanced,
      transitModes: props.modes.transitModes.map((m) => m.mode)
    }
  }

  _planTrip = () => {
    const { beginCallIfNeeded, currentQuery, routingQuery } = this.props
    const issues = []
    if (!hasValidLocation(currentQuery, 'from')) issues.push('from')
    if (!hasValidLocation(currentQuery, 'to')) issues.push('to')
    if (issues.length > 0) {
      // TODO: replace with less obtrusive validation.
      window.alert(
        `Please define the following fields to plan a trip: ${issues.join(
          ', '
        )}`
      )
      return
    }
    if (this.state.expandAdvanced) this.setState({ expandAdvanced: false })
    // Ensure call is started, or start a new one.
    beginCallIfNeeded()
    routingQuery()
  }

  _addPlace = (result, index) => {
    const intermediatePlaces =
      [...this.props.currentQuery.intermediatePlaces] || []
    if (result && index !== undefined) {
      // If adding an actual intermediate place with location. Overwrite the
      // placeholder with the new value.
      intermediatePlaces.splice(index, 1, result.location)
    } else {
      // Otherwise, we're just adding a dummy place.
      intermediatePlaces.push({})
    }
    this.props.setQueryParam({ intermediatePlaces })
  }

  _removePlace = ({ index }) => {
    const intermediatePlaces =
      [...this.props.currentQuery.intermediatePlaces] || []
    intermediatePlaces.splice(index, 1)
    this.props.setQueryParam({ intermediatePlaces })
  }

  _onHideAdvancedClick = () => {
    const expandAdvanced = !this.state.expandAdvanced
    // FIXME move logic to action
    storeItem('expandAdvanced', expandAdvanced)
    this.setState({ expandAdvanced })
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

  _updateGroupSize = (evt) => this.props.setGroupSize(+evt.target.value)

  render() {
    const {
      activeSearch,
      currentQuery,
      groupSize,
      intl,
      mainPanelContent,
      maxGroupSize,
      mobile,
      modes,
      routes,
      setQueryParam,
      showUserSettings,
      timeFormat
    } = this.props
    // FIXME: Remove showPlanTripButton
    const showPlanTripButton =
      mainPanelContent === 'EDIT_DATETIME' ||
      mainPanelContent === 'EDIT_SETTINGS'
    const { date, departArrive, from, intermediatePlaces, mode, time, to } =
      currentQuery
    const { expandAdvanced } = this.state
    const advancedSearchStyle = {
      background: 'white',
      display: expandAdvanced ? undefined : 'none',
      left: '0px',
      padding: '0px 8px 5px',
      position: 'absolute',
      right: '0px',
      zIndex: 99999
    }
    return (
      <ViewerContainer>
        {/* FIXME: should this be a styled component */}
        <div
          className="main-panel"
          style={{
            bottom: showPlanTripButton ? 55 : 0,
            left: 0,
            overflow: 'hidden',
            paddingBottom: 15,
            position: 'absolute',
            right: 0,
            top: 0
          }}
        >
          <div className="form" style={{ padding: '5px 10px' }}>
            <LocationField
              inputPlaceholder={intl.formatMessage(
                { id: 'common.searchForms.enterStartLocation' },
                { mobile }
              )}
              locationType="from"
              showClearButton
            />
            {Array.isArray(intermediatePlaces) &&
              intermediatePlaces.map((place, i) => {
                return (
                  <IntermediatePlace
                    index={i}
                    inputPlaceholder={intl.formatMessage({
                      id: 'components.CallTakerPanel.intermediateDestination'
                    })}
                    key={i}
                    location={place}
                    // FIXME: allow intermediate location type.
                    locationType="to"
                    onLocationCleared={this._removePlace}
                    // FIXME: function def
                    onLocationSelected={(result) => this._addPlace(result, i)}
                    showClearButton={!mobile}
                  />
                )
              })}
            <LocationField
              inputPlaceholder={intl.formatMessage(
                { id: 'common.searchForms.enterDestination' },
                { mobile }
              )}
              locationType="to"
              showClearButton={!mobile}
            />
            <div className="switch-button-container" style={{ top: '20px' }}>
              <SwitchButton
                content={<i className="fa fa-exchange fa-rotate-90" />}
              />
            </div>
            <AddPlaceButton
              from={from}
              intermediatePlaces={intermediatePlaces}
              onClick={this._addPlace}
              to={to}
            />
            <div className="search-options">
              <DateTimeOptions
                date={date}
                departArrive={departArrive}
                onKeyDown={this._handleFormKeyDown}
                setQueryParam={setQueryParam}
                time={time}
                timeFormat={timeFormat}
              />
              <ModeDropdown
                mode={mode}
                modes={modes}
                onChange={setQueryParam}
                onKeyDown={this._handleFormKeyDown}
                selectedTransitModes={this.state.transitModes}
                updateTransitModes={(transitModes) => {
                  this.setState({ transitModes })
                }}
              />
              <Button
                bsSize="small"
                bsStyle="default"
                onClick={this._planTrip}
                style={{
                  fontSize: '13px',
                  padding: '1px 10px'
                }}
              >
                Plan
              </Button>
            </div>
            <div className="advanced-search-options-container">
              {groupSize !== null && maxGroupSize && (
                <span className="pull-right">
                  <FormattedMessage id="components.CallTakerPanel.groupSize" />
                  <InputWithSpace
                    max={maxGroupSize}
                    min={0}
                    onChange={this._updateGroupSize}
                    onKeyDown={this._handleFormKeyDown}
                    step={1}
                    style={{ lineHeight: '0.8em' }}
                    type="number"
                    value={groupSize}
                  />
                </span>
              )}
              <Button
                className="hide-button clear-button-formatting"
                onClick={this._onHideAdvancedClick}
              >
                <i
                  className={`fa fa-caret-${expandAdvanced ? 'up' : 'down'}`}
                />
                <FormattedMessage id="components.CallTakerPanel.advancedOptions" />
              </Button>
              <div
                className="advanced-search-options"
                style={advancedSearchStyle}
              >
                <AdvancedOptions
                  currentQuery={currentQuery}
                  findRoutes={this.props.findRoutes}
                  modes={modes}
                  onKeyDown={this._handleFormKeyDown}
                  routes={routes}
                  setQueryParam={setQueryParam}
                />
              </div>
            </div>
          </div>
          {!activeSearch && !showPlanTripButton && showUserSettings && (
            <UserSettings />
          )}
          <div className="desktop-narrative-container">
            {/* FIXME: Achieve this partially scrolling layout as below
                without using absolute positioning and by sharing styles with BatchRoutingPanel. */}
            <NarrativeItineraries
              containerStyle={{
                bottom: '0',
                display: 'flex',
                flexDirection: 'column',
                left: '0',
                position: 'absolute',
                right: '0',
                top: '210px'
              }}
            />
          </div>
        </div>
      </ViewerContainer>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state) => {
  const { activeId, requests } = state.callTaker.fieldTrip
  const request = requests.data.find((req) => req.id === activeId)
  const showUserSettings = getShowUserSettings(state)
  return {
    activeSearch: getActiveSearch(state),
    currentQuery: state.otp.currentQuery,
    expandAdvanced: state.otp.user.expandAdvanced,
    groupSize: state.callTaker.fieldTrip.groupSize,
    mainPanelContent: state.otp.ui.mainPanelContent,
    maxGroupSize: getGroupSize(request),
    modes: state.otp.config.modes,
    routes: state.otp.transitIndex.routes,
    showUserSettings,
    timeFormat: getTimeFormat(state.otp.config)
  }
}

const mapDispatchToProps = {
  beginCallIfNeeded: callTakerActions.beginCallIfNeeded,
  findRoutes: apiActions.findRoutes,
  routingQuery: apiActions.routingQuery,
  setGroupSize: fieldTripActions.setGroupSize,
  setQueryParam: formActions.setQueryParam
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CallTakerPanel))
