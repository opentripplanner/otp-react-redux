import React, { Component, useContext } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import BatchSettingsPanel from '../form/batch-settings-panel'
import DateTimePreview from '../form/date-time-preview'
import DateTimeModal from '../form/date-time-modal'
import LocationField from '../form/connected-location-field'
import UserSettings from '../form/user-settings'
import Icon from '../narrative/icon'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { ComponentContext } from '../../util/contexts'
import { hasValidLocation, getActiveSearch, getShowUserSettings } from '../../util/state'
import ViewerContainer from '../viewers/viewer-container'

const MODE_BUTTONS = [
  {
    mode: 'TRANSIT',
    label: 'Transit'
  },
  {
    mode: 'WALK',
    label: 'Walking'
  },
  {
    mode: 'CAR',
    label: 'Drive'
  },
  {
    mode: 'BICYCLE',
    label: 'Bicycle'
  },
  {
    icon: 'mobile',
    mode: 'RENT', // TODO: include HAIL?
    label: 'Rental options'
  }
]

const POSSIBLE_MODES = MODE_BUTTONS.map(b => b.mode)

function listHasMode (list, mode) {
  return list.some(m => mode.indexOf(m) !== -1)
}

/**
 * Main panel for the batch/trip comparison form.
 * @extends Component
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
    this.setState({selectedModes: newModes})
    const disabledModes = POSSIBLE_MODES.filter(m => !newModes.includes(m))
    const newCombinations = possibleCombinations
      .filter(c => {
        // Do not include combination if any of its modes are found in disabled
        // modes list.
        const modes = c.mode.split(',')
        return !modes.some(m => listHasMode(disabledModes, m))
      })
    setQueryParam({combinations: newCombinations})
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
    this.setState({expanded: null})
    routingQuery()
  }

  _getExpandedValue = (value) => this.state.expanded === value ? null : value

  _toggleDateTime = () => {
    this.setState({expanded: this._getExpandedValue('dateTime')})
  }

  _toggleSettings = () => {
    this.setState({expanded: this._getExpandedValue('settings')})
  }

  render () {
    const {
      activeSearch,
      mobile,
      showUserSettings
    } = this.props
    const {expanded, selectedModes, width} = this.state
    const actionText = mobile ? 'tap' : 'click'
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
    if (expanded === 'dateTime') {
      dateTimePreviewStyle.height = '50px'
    }
    const settingsPreviewStyle = {
      ...squareButtonStyle,
      lineHeight: '22px',
      marginRight: '5px',
      padding: '10px 0px'
    }
    if (expanded === 'settings') {
      settingsPreviewStyle.height = '50px'
    }
    return (
      <ViewerContainer style={{overflow: 'hidden'}}>
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
        }} className='mode-buttons'>
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
          <div style={{display: 'contents'}} className='mode-buttons'>
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
            }} >
            <Icon type='search' className='fa-2x' />
          </Button>
        </div>
        {expanded === 'dateTime' &&
          <DateTimeModal style={{
            ...expandableBoxStyle,
            padding: '10px 20px'
          }} />
        }
        {expanded === 'settings' &&
          <div style={{...expandableBoxStyle, padding: '5px 10px'}}>
            <BatchSettingsPanel />
          </div>
        }
        {!activeSearch && showUserSettings &&
          <UserSettings />
        }
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

const checkMark = (
  <Icon
    style={{position: 'absolute', bottom: '2px', right: '2px', color: 'green'}}
    type='check' />
)

const ModeButtons = ({className, endStyle = {}, onClick, selectedModes = [], style = {}}) => {
  const {ModeIcon} = useContext(ComponentContext)
  return MODE_BUTTONS.map((item, index) => {
    let buttonStyle = style
    if (index === MODE_BUTTONS.length - 1) {
      buttonStyle = {...buttonStyle, ...endStyle}
    }
    const icon = item.icon
      ? <Icon className='fa-2x' type={item.icon} />
      : <ModeIcon height={25} mode={item.mode} />
    return (
      <button
        className={className}
        key={item.mode}
        onClick={() => onClick(item.mode)}
        // FIXME: add hover dropdown
        onMouseEnter={undefined}
        onMouseLeave={undefined}
        style={buttonStyle}
        title={item.label}
      >
        {icon}
        {selectedModes.indexOf(item.mode) !== -1 && checkMark}
      </button>
    )
  })
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
