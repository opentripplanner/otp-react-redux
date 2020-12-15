import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import BatchSettingsPanel from '../form/batch-settings-panel'
import LocationField from '../form/connected-location-field'
import DateTimeModal from '../form/date-time-modal'
import ModeButtons, {MODE_OPTIONS, StyledModeButton} from '../form/mode-buttons'
// import UserSettings from '../form/user-settings'
import Icon from '../narrative/icon'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import {
  BatchSettingsPanelContainer,
  DateTimeModalContainer,
  MainSettingsRow,
  PlanTripButton,
  SettingsPreview,
  StyledDateTimePreview
} from './styled'
import { hasValidLocation, getActiveSearch, getShowUserSettings } from '../../util/state'
import ViewerContainer from '../viewers/viewer-container'

/**
 * Simple utility to check whether a list of mode strings contains the provided
 * mode. This handles exact match and prefix/suffix matches (i.e., checking
 * 'BICYCLE' will return true if 'BICYCLE' or 'BICYCLE_RENT' is in the list).
 *
 * FIXME: This might need to be modified to be a bit looser in how it handles
 * the 'contains' check. E.g., we might not want to remove WALK,TRANSIT if walk
 * is turned off, but we DO want to remove it if TRANSIT is turned off.
 */
function listHasMode (modes, mode) {
  return modes.some(m => mode.indexOf(m) !== -1)
}

function combinationHasAnyOfModes (combination, modes) {
  return combination.mode.split(',').some(m => listHasMode(modes, m))
}

// List of possible modes that can be selected via mode buttons.
const POSSIBLE_MODES = MODE_OPTIONS.map(b => b.mode)

const ModeButtonsFullWidthContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`

// Define Mode Button styled components here to avoid circular imports. I.e., we
// cannot define them in styled.js (because mode-buttons.js imports buttonCss
// and then we would need to import ModeButtons/StyledModeButton from that file
// in turn).
const StyledModeButtonsFullWidth = styled(ModeButtons)`
  &:last-child {
    margin-right: 0px;
  }
`

const ModeButtonsContainerCompressed = styled.div`
  display: contents;
`

const ModeButtonsCompressed = styled(ModeButtons)`
  ${StyledModeButton} {
    border-radius: 0px;
  }
  &:first-child {
    border-radius: 5px 0px 0px 5px;
  }
  &:last-child {
    margin-right: 5px;
    border-radius: 0px 5px 5px 0px;
  }
`

/**
 * Main panel for the batch/trip comparison form.
 */
class BatchRoutingPanel extends Component {
  state = {
    expanded: null,
    selectedModes: POSSIBLE_MODES
  }

  componentDidMount () {
    this.updateWindowWidth()
    window.addEventListener('resize', this.updateWindowWidth)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateWindowWidth)
  }

  updateWindowWidth = () => this.setState({width: window.innerWidth})

  _onClickMode = (mode) => {
    const {possibleCombinations, setQueryParam} = this.props
    const {selectedModes} = this.state
    const index = selectedModes.indexOf(mode)
    const enableMode = index === -1
    const newModes = [...selectedModes]
    if (enableMode) newModes.push(mode)
    else newModes.splice(index, 1)
    // Update selected modes for mode buttons.
    this.setState({selectedModes: newModes})
    // Update the available mode combinations based on the new modes selection.
    const disabledModes = POSSIBLE_MODES.filter(m => !newModes.includes(m))
    // Do not include combination if any of its modes are found in disabled
    // modes list.
    const newCombinations = possibleCombinations
      .filter(c => !combinationHasAnyOfModes(c, disabledModes))
    setQueryParam({combinations: newCombinations})
  }

  _planTrip = () => {
    const {currentQuery, routingQuery} = this.props
    // Check for any validation issues in query.
    const issues = []
    if (!hasValidLocation(currentQuery, 'from')) issues.push('from')
    if (!hasValidLocation(currentQuery, 'to')) issues.push('to')
    if (issues.length > 0) {
      // TODO: replace with less obtrusive validation.
      window.alert(`Please define the following fields to plan a trip: ${issues.join(', ')}`)
      return
    }
    // Close any expanded panels.
    this.setState({expanded: null})
    // Plan trip.
    routingQuery()
  }

  _updateExpanded = (type) => ({expanded: this.state.expanded === type ? null : type})

  _toggleDateTime = () => this.setState(this._updateExpanded('DATE_TIME'))

  _toggleSettings = () => this.setState(this._updateExpanded('SETTINGS'))

  render () {
    const {mobile} = this.props
    const {expanded, selectedModes, width} = this.state
    const actionText = mobile ? 'tap' : 'click'
    return (
      <ViewerContainer className='batch-routing-panel'>
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
        <ModeButtonsFullWidthContainer className='hidden-lg'>
          <StyledModeButtonsFullWidth
            className='flex'
            onClick={this._onClickMode}
            selectedModes={selectedModes}
          />
        </ModeButtonsFullWidthContainer>
        <MainSettingsRow>
          <SettingsPreview
            expanded={expanded === 'SETTINGS'}
            onClick={this._toggleSettings}
          >
            <Icon type='cog' className='fa-2x' />
          </SettingsPreview>
          <StyledDateTimePreview
            // as='button'
            expanded={expanded === 'DATE_TIME'}
            hideButton
            onClick={this._toggleDateTime} />
          <ModeButtonsContainerCompressed>
            <ModeButtonsCompressed
              className='visible-lg straight-corners'
              onClick={this._onClickMode}
              selectedModes={selectedModes}
            />
          </ModeButtonsContainerCompressed>
          <PlanTripButton
            onClick={this._planTrip}
            title='Plan trip'
          >
            <Icon type='search' className='fa-2x' />
          </PlanTripButton>
        </MainSettingsRow>
        {expanded === 'DATE_TIME' &&
          <DateTimeModalContainer>
            <DateTimeModal />
          </DateTimeModalContainer>
        }
        {expanded === 'SETTINGS' &&
          <BatchSettingsPanelContainer>
            <BatchSettingsPanel />
          </BatchSettingsPanelContainer>
        }
        {/* FIXME: Add back user settings (home, work, etc.) once connected to
            the middleware persistence.
          !activeSearch && showUserSettings &&
          <UserSettings />
        */}
        <div className='desktop-narrative-container'>
          <NarrativeItineraries
            containerStyle={{
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              // This is variable dependent on height of the form above. If the
              // screen width is less than 1200 (Bootstrap's "large" size), the
              // mode buttons will be shown on their own row, meaning that the
              // top position of this component needs to be lower (higher value
              // equals lower position on the page).
              top: width < 1200 ? '210px' : '160px',
              right: '0',
              left: '0',
              bottom: '0'
            }}
          />
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
    expandAdvanced: state.otp.user.expandAdvanced,
    possibleCombinations: state.otp.config.modes.combinations,
    showUserSettings
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchRoutingPanel)
