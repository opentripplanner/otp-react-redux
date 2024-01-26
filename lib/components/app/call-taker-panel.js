// TODO: Typescript once common types exist
/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { CaretDown } from '@styled-icons/fa-solid/CaretDown'
import { CaretUp } from '@styled-icons/fa-solid/CaretUp'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as callTakerActions from '../../actions/call-taker'
import * as fieldTripActions from '../../actions/field-trip'
import * as formActions from '../../actions/form'
import { defaultDropdownConfig, getGroupSize } from '../../util/call-taker'
import { generateModeSettingValues } from '../../util/api'
import {
  getActiveSearch,
  getShowUserSettings,
  getSortedFilteredRoutes,
  hasValidLocation
} from '../../util/state'
import { getModuleConfig, Modules } from '../../util/config'
import { StyledIconWrapper } from '../util/styledIcon'
import AddPlaceButton from '../form/add-place-button'
import AdvancedOptions from '../form/call-taker/advanced-options'
import DateTimeOptions from '../form/call-taker/date-time-picker'
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
      enabledModes: props.modeDropdownOptions?.[0].combination,
      expandAdvanced: props.expandAdvanced,
      planTripClicked: false,
      queryChanged: false
    }
  }

  _planTrip = () => {
    const { beginCallIfNeeded, currentQuery, routingQuery } = this.props
    const issues = []
    if (!hasValidLocation(currentQuery, 'from')) issues.push('from')
    if (!hasValidLocation(currentQuery, 'to')) issues.push('to')
    this.setState({ planTripClicked: true })
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

  _handleUpdateModes = (modes) => {
    this.setState({ enabledModes: modes })
    this.props.setQueryParam({ modes })
  }

  _updateGroupSize = (evt) => this.props.setGroupSize(+evt.target.value)

  componentDidMount() {
    this.props.setQueryParam({ modes: this.state.enabledModes })
  }

  componentDidUpdate(prevProps) {
    if (
      // Only enabled when field trip is enabled, as otherwise
      // this flashes a lot, possibly to an annoying extent
      this.props.fieldTripVisible &&
      (prevProps?.currentQuery?.from?.name !==
        this.props?.currentQuery?.from?.name ||
        prevProps?.currentQuery?.to?.name !==
          this.props?.currentQuery?.to?.name)
    ) {
      this.setState({ queryChanged: true }, () => {
        setTimeout(() => {
          this.setState({ queryChanged: false })
        }, 1000)
      })
    }
  }

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
      setUrlSearch,
      showUserSettings,
      timeFormat,
      usingOtp2
    } = this.props
    // FIXME: Remove showPlanTripButton
    const showPlanTripButton =
      mainPanelContent === 'EDIT_DATETIME' ||
      mainPanelContent === 'EDIT_SETTINGS'
    const { date, departArrive, from, intermediatePlaces, time, to } =
      currentQuery
    const { expandAdvanced, planTripClicked, queryChanged } = this.state
    const advancedSearchStyle = {
      display: expandAdvanced ? undefined : 'none'
    }
    const mapAction = mobile
      ? intl.formatMessage({
          id: 'common.searchForms.tap'
        })
      : intl.formatMessage({
          id: 'common.searchForms.click'
        })
    return (
      // {/* FIXME: should this be a styled component */}
      <ViewerContainer
        className="main-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <div className="form" style={{ padding: '5px 10px' }}>
          <span
            className={`batch-routing-panel-location-fields ${
              queryChanged && 'animate-highlight'
            }`}
          >
            <LocationField
              inputPlaceholder={intl.formatMessage(
                { id: 'common.searchForms.enterStartLocation' },
                { mapAction }
              )}
              isRequired
              locationType="from"
              selfValidate={planTripClicked}
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
                { mapAction }
              )}
              isRequired
              locationType="to"
              selfValidate={planTripClicked}
              showClearButton={!mobile}
            />
            <div className="switch-button-container" style={{ top: '20px' }}>
              <SwitchButton />
            </div>
          </span>
          <AddPlaceButton
            from={from}
            intermediatePlaces={intermediatePlaces}
            onClick={this._addPlace}
            to={to}
          />
          <div className="search-options percy-hide">
            <DateTimeOptions
              date={date}
              departArrive={departArrive}
              onKeyDown={this._handleFormKeyDown}
              setQueryParam={setQueryParam}
              time={time}
              timeFormat={timeFormat}
            />
            <ModeDropdown
              onChangeModes={this._handleUpdateModes}
              onKeyDown={this._handleFormKeyDown}
            />
          </div>
          <div className="search-plan-button-container">
            <Button
              onClick={this._planTrip}
              style={{
                fontWeight: 'bold',
                width: '100%'
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
              <StyledIconWrapper>
                {expandAdvanced ? <CaretUp /> : <CaretDown />}
              </StyledIconWrapper>
              <FormattedMessage id="components.CallTakerPanel.advancedOptions" />
            </Button>
            <div
              className="advanced-search-options"
              style={advancedSearchStyle}
            >
              <AdvancedOptions
                currentQuery={currentQuery}
                findRoutesIfNeeded={this.props.findRoutesIfNeeded}
                modes={modes}
                modeSettings={this.props.modeSettingDefinitions}
                modeSettingValues={this.props.modeSettingValues}
                onKeyDown={this._handleFormKeyDown}
                routes={routes}
                setQueryParam={setQueryParam}
                setUrlSearch={setUrlSearch}
              />
            </div>
          </div>
        </div>
        {!activeSearch && !showPlanTripButton && showUserSettings && (
          <UserSettings style={{ margin: '0 10px', overflowY: 'auto' }} />
        )}
        <div
          className="desktop-narrative-container"
          style={{
            flexGrow: 1,
            overflowY: 'hidden'
          }}
        >
          <NarrativeItineraries />
        </div>
      </ViewerContainer>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state) => {
  const { activeId, groupSize, requests, visible } = state.callTaker.fieldTrip
  const request = requests.data.find((req) => req.id === activeId)
  const showUserSettings = getShowUserSettings(state)
  const moduleConfig = getModuleConfig(state, Modules.CALL_TAKER)?.options
  const urlSearchParams = new URLSearchParams(state.router.location.search)
  const modeSettingValues = generateModeSettingValues(
    urlSearchParams,
    state.otp?.modeSettingDefinitions || [],
    state.otp.config.modes?.initialState?.modeSettingValues
  )
  return {
    activeSearch: getActiveSearch(state),
    currentQuery: state.otp.currentQuery,
    fieldTripVisible: visible,
    groupSize,
    mainPanelContent: state.otp.ui.mainPanelContent,
    maxGroupSize: getGroupSize(request),
    modeDropdownOptions:
      moduleConfig?.modeDropdownOptions || defaultDropdownConfig,
    modes: state.otp.config.modes,
    modeSettingDefinitions: state.otp.config.modes.modeSettingDefinitions,
    modeSettingValues,
    routes: getSortedFilteredRoutes(state),
    showUserSettings,
    timeFormat: getTimeFormat(state.otp.config),
    usingOtp2:
      // This allows otp2 support to be partially disabled
      state.otp.config.api?.v2 || state.otp.config.defaultQueryParams?.otp2
  }
}

const mapDispatchToProps = {
  beginCallIfNeeded: callTakerActions.beginCallIfNeeded,
  findRoutesIfNeeded: apiActions.findRoutesIfNeeded,
  routingQuery: apiActions.routingQuery,
  setGroupSize: fieldTripActions.setGroupSize,
  setQueryParam: formActions.setQueryParam,
  setUrlSearch: apiActions.setUrlSearch
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CallTakerPanel))
