import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import { storeItem } from '@opentripplanner/core-utils/lib/storage'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import AddPlaceButton from '../form/add-place-button'
import AdvancedOptions from '../form/call-taker/advanced-options'
import DateTimeOptions from '../form/call-taker/date-time-options'
import ModeDropdown from '../form/call-taker/mode-dropdown'
import IntermediatePlace from '../form/intermediate-place-field'
import LocationField from '../form/connected-location-field'
import SwitchButton from '../form/switch-button'
import UserSettings from '../form/user-settings'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { hasValidLocation, getActiveSearch, getShowUserSettings } from '../../util/state'
import ViewerContainer from '../viewers/viewer-container'

/**
 * This is the main panel/sidebar for the Call Taker/Field Trip module. It
 * currently also serves as the main panel for the FDOT RMCE trip comparison view
 * which depends on the BATCH trip planning mode.
 */
class CallTakerPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expandAdvanced: props.expandAdvanced,
      transitModes: props.modes.transitModes.map(m => m.mode)
    }
  }

  _planTrip = () => {
    const {currentQuery, routingQuery} = this.props
    const issues = []
    if (!hasValidLocation(currentQuery, 'from')) issues.push('from')
    if (!hasValidLocation(currentQuery, 'to')) issues.push('to')
    if (issues.length > 0) {
      // TODO: replace with less obtrusive validation.
      window.alert(`Please define the following fields to plan a trip: ${issues.join(', ')}`)
      return
    }
    routingQuery()
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
      currentQuery,
      mainPanelContent,
      mobile,
      modes,
      routes,
      setQueryParam,
      showUserSettings,
      timeFormat
    } = this.props
    // FIXME: Remove showPlanTripButton
    const showPlanTripButton = mainPanelContent === 'EDIT_DATETIME' ||
      mainPanelContent === 'EDIT_SETTINGS'
    const {
      departArrive,
      date,
      from,
      intermediatePlaces,
      mode,
      time,
      to
    } = currentQuery
    const actionText = mobile ? 'tap' : 'click'
    const {expandAdvanced} = this.state
    const advancedSearchStyle = {
      zIndex: 99999,
      background: 'white',
      position: 'absolute',
      right: '0px',
      left: '0px',
      padding: '0px 8px 5px',
      display: expandAdvanced ? 'none' : undefined
    }
    return (
      <ViewerContainer>
        {/* FIXME: should this be a styled component */}
        <div className='main-panel' style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: showPlanTripButton ? 55 : 0,
          paddingBottom: 15,
          overflow: 'hidden',
          padding: '10px'
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
            <div
              style={{top: '20px'}}
              className='switch-button-container'>
              <SwitchButton content={<i className='fa fa-exchange fa-rotate-90' />} />
            </div>
            <AddPlaceButton
              from={from}
              intermediatePlaces={intermediatePlaces}
              onClick={this._addPlace}
              to={to}
            />
            <div className='search-options' style={{height: '30px'}}>
              <DateTimeOptions
                date={date}
                departArrive={departArrive}
                onKeyDown={this._handleFormKeyDown}
                setQueryParam={setQueryParam}
                time={time}
                timeFormat={timeFormat} />
              <ModeDropdown
                mode={mode}
                modes={modes}
                onChange={setQueryParam}
                onKeyDown={this._handleFormKeyDown}
                selectedTransitModes={this.state.transitModes}
                updateTransitModes={transitModes => this.setState({transitModes})} />
              <Button
                bsStyle='default'
                bsSize='small'
                onClick={this._planTrip}
                style={{
                  fontSize: '13px',
                  padding: '0px 10px',
                  position: 'absolute',
                  right: '6px'
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
              <div className='advanced-search-options' style={advancedSearchStyle}>
                <AdvancedOptions
                  currentQuery={currentQuery}
                  findRoutes={this.props.findRoutes}
                  modes={modes}
                  onKeyDown={this._handleFormKeyDown}
                  routes={routes}
                  setQueryParam={setQueryParam} />
              </div>
            </div>
          </div>
          {!activeSearch && !showPlanTripButton && showUserSettings &&
            <UserSettings />
          }
          <div className='desktop-narrative-container'>
            <NarrativeItineraries
              containerStyle={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                // FIXME: This top pixel value can be variable dependent on
                // height of the form above. It may need to be specified differently
                top: 193 + intermediatePlaces.length * 45,
                right: '0',
                left: '0',
                bottom: '0'
              }}
            />
          </div>
        </div>
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
    expandAdvanced: state.user.localUser.expandAdvanced,
    mainPanelContent: state.otp.ui.mainPanelContent,
    modes: state.otp.config.modes,
    routes: state.otp.transitIndex.routes,
    showUserSettings,
    timeFormat: getTimeFormat(state.otp.config)
  }
}

const mapDispatchToProps = {
  findRoutes: apiActions.findRoutes,
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(CallTakerPanel)
