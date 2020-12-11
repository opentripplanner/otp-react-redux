import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import BatchSettingsPanel from '../form/batch-settings-panel'
import DateTimePreview from '../form/date-time-preview'
import LocationField from '../form/connected-location-field'
import DateTimeModal from '../form/date-time-modal'
import ModeButtons, {MODE_OPTIONS} from '../form/mode-buttons'
// import UserSettings from '../form/user-settings'
import Icon from '../narrative/icon'
import NarrativeItineraries from '../narrative/narrative-itineraries'
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

const squareButtonStyle = {
  height: '45px',
  width: '45px',
  margin: '0px',
  border: '0px'
}
const modeButtonStyle = {
  ...squareButtonStyle,
  position: 'relative',
  border: '0px'
}
const growButtonStyle = {
  ...modeButtonStyle,
  flexGrow: 1,
  marginRight: '5px'
}
const expandableBoxStyle = {
  backgroundColor: 'rgb(239, 239, 239)',
  boxShadow: 'rgba(0, 0, 0, 0.32) 7px 12px 10px',
  height: '245px',
  position: 'absolute',
  width: '96%',
  zIndex: '99999'
}

// List of possible modes that can be selected via mode buttons.
const POSSIBLE_MODES = MODE_OPTIONS.map(b => b.mode)

/**
 * Main panel for the batch/trip comparison form.
 */
class BatchRoutingPanel extends Component {
  state = {
    expanded: null,
    selectedModes: POSSIBLE_MODES,
    width: 0
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
    const dateTimePreviewStyle = {
      ...squareButtonStyle,
      backgroundColor: 'rgb(239, 239, 239)',
      cursor: 'pointer',
      fontSize: '12px',
      marginRight: '5px',
      padding: '7px 5px',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      width: '120px'
    }
    const settingsPreviewStyle = {
      ...squareButtonStyle,
      lineHeight: '22px',
      marginRight: '5px',
      padding: '10px 0px'
    }
    if (expanded === 'DATE_TIME') {
      dateTimePreviewStyle.height = '50px'
    }
    if (expanded === 'SETTINGS') {
      settingsPreviewStyle.height = '50px'
    }
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '5px'
        }} className='mode-buttons-full-width'>
          <ModeButtons
            className='hidden-lg'
            endStyle={{marginRight: '0px'}}
            onClick={this._onClickMode}
            selectedModes={selectedModes}
            style={growButtonStyle} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          flexDirection: 'row',
          alignItems: 'top'
        }} className='comparison-form'>
          <button
            onClick={this._toggleSettings}
            style={settingsPreviewStyle}>
            <Icon type='cog' className='fa-2x' />
          </button>
          <DateTimePreview
            className='date-time-preview'
            hideButton
            onClick={this._toggleDateTime}
            style={dateTimePreviewStyle} />
          <div style={{display: 'contents'}} className='mode-buttons-compressed'>
            <ModeButtons
              className='visible-lg'
              endStyle={{marginRight: '5px'}}
              onClick={this._onClickMode}
              selectedModes={selectedModes}
              style={modeButtonStyle} />
          </div>
          <Button
            onClick={this._planTrip}
            style={{
              ...squareButtonStyle,
              backgroundColor: '#F5F5A7',
              marginLeft: 'auto',
              padding: '5px'
            }}
            title='Plan trip'
          >
            <Icon type='search' className='fa-2x' />
          </Button>
        </div>
        {expanded === 'DATE_TIME' &&
          <DateTimeModal style={{
            ...expandableBoxStyle,
            borderRadius: '5px 5px 5px 5px',
            padding: '10px 20px'
          }} />
        }
        {expanded === 'SETTINGS' &&
          <BatchSettingsPanel style={{
            ...expandableBoxStyle,
            borderRadius: '0px 5px 5px 5px',
            padding: '5px 10px'
          }} />
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
