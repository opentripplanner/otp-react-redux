/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { ExchangeAlt } from '@styled-icons/fa-solid/ExchangeAlt'
import { injectIntl } from 'react-intl'
import React, { Component } from 'react'

import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { StyledIconWrapper } from '../util/styledIcon'
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
    const mapAction = mobile
      ? intl.formatMessage({
          id: 'common.searchForms.tap'
        })
      : intl.formatMessage({
          id: 'common.searchForms.click'
        })

    return (
      <ViewerContainer
        className="batch-routing-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <form
          className="form"
          onSubmit={(e) => e.preventDefault()}
          style={{ padding: '10px' }}
        >
          <LocationField
            inputPlaceholder={intl.formatMessage(
              { id: 'common.searchForms.enterStartLocation' },
              { mapAction }
            )}
            locationType="from"
            showClearButton
          />
          <LocationField
            inputPlaceholder={intl.formatMessage(
              { id: 'common.searchForms.enterDestination' },
              { mapAction }
            )}
            locationType="to"
            showClearButton={!mobile}
          />
          <div className="switch-button-container">
            <SwitchButton
              content={
                <StyledIconWrapper rotate90>
                  <ExchangeAlt />
                </StyledIconWrapper>
              }
            />
          </div>
          <BatchSettings />
        </form>
        {!activeSearch && showUserSettings && (
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
  const showUserSettings = getShowUserSettings(state)
  return {
    activeSearch: getActiveSearch(state),
    showUserSettings
  }
}

export default connect(mapStateToProps)(injectIntl(BatchRoutingPanel))
