import React, { Component } from 'react'
import {Button} from 'react-bootstrap'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'
import LocationField from '../form/connected-location-field'
import UserSettings from '../form/user-settings'
import Icon from '../narrative/icon'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import ViewerContainer from '../viewers/viewer-container'

/**
 * Main panel for the batch/trip comparison form.
 * @extends Component
 */
class BatchRoutingPanel extends Component {
  _planTrip = () => this.props.routingQuery()

  render () {
    const {
      activeSearch,
      itineraryFooter,
      LegIcon,
      mobile,
      showUserSettings
    } = this.props
    const actionText = mobile ? 'tap' : 'click'
    return (
      <ViewerContainer>
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
          justifyContent: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center'
        }} className='comparison-form'>
          <button
            style={{
              height: '50px',
              width: '50px',
              margin: '0px',
              marginRight: '5px'
            }}
          >
            <Icon type='cog' className='fa-2x' />
          </button>
          <button
            style={{
              height: '50px',
              width: '100px',
              margin: '0px',
              fontSize: 'small',
              textAlign: 'left'
            }}
          >
            <Icon type='calendar' /> Today<br />
            <Icon type='clock-o' /> Now<br />
          </button>
          <Button
            bsStyle='default'
            bsSize='small'
            onClick={this._planTrip}
            style={{
              height: '50px',
              width: '50px',
              margin: '0px',
              marginLeft: 'auto',
              backgroundColor: '#F5F5A7'
            }} >
            <Icon type='search' className='fa-2x' />
          </Button>
        </div>
        {!activeSearch && showUserSettings &&
          <UserSettings />
        }
        <div className='desktop-narrative-container'>
          <NarrativeItineraries
            itineraryFooter={itineraryFooter}
            LegIcon={LegIcon}
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
    expandAdvanced: state.otp.user.expandAdvanced,
    showUserSettings
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchRoutingPanel)
