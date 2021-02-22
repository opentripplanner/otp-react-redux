import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import BatchSettings from '../form/batch-settings'
import LocationField from '../form/connected-location-field'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import ViewerContainer from '../viewers/viewer-container'

// Style for setting the top of the narrative itineraries based on the width of the window.
// If the window width is less than 1200px (Bootstrap's "large" size), the
// mode buttons will be shown on their own row, meaning that the
// top position of this component needs to be lower (higher value
// equals lower position on the page).
// TODO: figure out a better way to use flex rendering for accommodating the mode button overflow.
const NarrativeContainer = styled.div`
  & .options.itinerary {
    @media (min-width: 1200px) {
      top: 160px;
    }
    @media (max-width: 1199px) {
      top: 210px;
    }
  }
`

/**
 * Main panel for the batch/trip comparison form.
 */
class BatchRoutingPanel extends Component {
  render () {
    const {mobile} = this.props
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
        <BatchSettings />
        {/* FIXME: Add back user settings (home, work, etc.) once connected to
            the middleware persistence.
          !activeSearch && showUserSettings &&
          <UserSettings />
        */}
        <NarrativeContainer className='desktop-narrative-container'>
          <NarrativeItineraries
            containerStyle={{
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              right: '0',
              left: '0',
              bottom: '0'
            }}
          />
        </NarrativeContainer>
      </ViewerContainer>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const showUserSettings = getShowUserSettings(state.otp)
  return {
    activeSearch: getActiveSearch(state.otp),
    config: state.otp.config,
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
