/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import React, { Component } from 'react'

import { getActiveSearch, getShowUserSettings } from '../../util/state'
import BatchSettings from '../form/batch-settings'
import LocationField from '../form/connected-location-field'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import SwitchButton from '../form/switch-button'
import UserSettings from '../form/user-settings'
import ViewerContainer from '../viewers/viewer-container'

/**
 * Main panel for the batch/trip comparison form.
 */
class BatchRoutingPanel extends Component {
  render() {
    const { activeSearch, intl, mobile, showUserSettings } = this.props
    return (
      <ViewerContainer
        className="batch-routing-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <div className="form" style={{ padding: '10px' }}>
          <LocationField
            inputPlaceholder={intl.formatMessage(
              { id: 'common.searchForms.enterStartLocation' },
              { mobile }
            )}
            locationType="from"
            showClearButton
          />
          <LocationField
            inputPlaceholder={intl.formatMessage(
              { id: 'common.searchForms.enterDestination' },
              { mobile }
            )}
            locationType="to"
            showClearButton={!mobile}
          />
          <div className="switch-button-container">
            <SwitchButton
              content={<i className="fa fa-exchange fa-rotate-90" />}
            />
          </div>
          <BatchSettings />
        </div>
        {!activeSearch && showUserSettings && (
          <UserSettings style={{ margin: '10px 0 0' }} />
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
  const showUserSettings = getShowUserSettings(state)
  return {
    activeSearch: getActiveSearch(state),
    showUserSettings
  }
}

export default connect(mapStateToProps)(injectIntl(BatchRoutingPanel))
