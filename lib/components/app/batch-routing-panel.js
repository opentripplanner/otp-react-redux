import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import BatchSettings from '../form/batch-settings'
import LocationField from '../form/connected-location-field'
import UserSettings from '../form/user-settings'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import ViewerContainer from '../viewers/viewer-container'
import SwitchButton from '../form/switch-button'

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
    const { activeSearch, intl, mobile, showUserSettings} = this.props
    const actionText = mobile ? 'tap' : 'click' // FIXME: QBDM: add intl
    return (
      <ViewerContainer className='batch-routing-panel'>
        <div className='locations'>
          <LocationField
            inputPlaceholder={
              intl.formatMessage(
                { id: 'common.searchForms.enterStartLocation' },
                { mobile }
              )
            }
            locationType='from'
            showClearButton
          />
          <LocationField
            inputPlaceholder={
              intl.formatMessage(
                { id: 'common.searchForms.enterDestination' },
                { mobile }
              )
            }
            locationType='to'
            showClearButton={!mobile}
          />
          <div className='switch-button-container'>
            <SwitchButton content={<i className='fa fa-exchange fa-rotate-90' />} />
          </div>
        </div>
        <BatchSettings />
        {!activeSearch && showUserSettings &&
          <UserSettings style={{ margin: '10px 0 0' }} />
        }
        <NarrativeContainer className='desktop-narrative-container'>
          <NarrativeItineraries
            containerStyle={{
              bottom: '0',
              display: 'flex',
              flexDirection: 'column',
              left: '0',
              position: 'absolute',
              right: '0'
            }}
          />
        </NarrativeContainer>
      </ViewerContainer>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const showUserSettings = getShowUserSettings(state)
  return {
    activeSearch: getActiveSearch(state),
    config: state.otp.config,
    currentQuery: state.otp.currentQuery,
    expandAdvanced: state.user.localUser.expandAdvanced,
    possibleCombinations: state.otp.config.modes.combinations,
    showUserSettings
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(BatchRoutingPanel)
)
