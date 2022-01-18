/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import React, { Component } from 'react'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import BatchSettings from '../form/batch-settings'
import LocationField from '../form/connected-location-field'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import SwitchButton from '../form/switch-button'
import ViewerContainer from '../viewers/viewer-container'

/**
 * Main panel for the batch/trip comparison form.
 */
class BatchRoutingPanel extends Component {
  render() {
    const { intl, mobile } = this.props
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
        {/* FIXME: Add back user settings (home, work, etc.) once connected to
            the middleware persistence.
          !activeSearch && showUserSettings &&
          <UserSettings />
        */}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BatchRoutingPanel))
