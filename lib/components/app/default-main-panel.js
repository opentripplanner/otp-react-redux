import React, { Component } from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash.isequal'

import ViewerContainer from '../viewers/viewer-container'
import DefaultSearchForm from '../form/default-search-form'
import PlanTripButton from '../form/plan-trip-button'
import UserSettings from '../form/user-settings'
import NarrativeRoutingResults from '../narrative/narrative-routing-results'
import { getActiveSearch, getShowUserSettings } from '../../util/state'

class DefaultMainPanel extends Component {
  render () {
    const {
      activeSearch,
      currentQuery,
      mainPanelContent,
      showUserSettings
    } = this.props
    const showPlanTripButton = mainPanelContent === 'EDIT_DATETIME' ||
      mainPanelContent === 'EDIT_SETTINGS'
    const mostRecentQuery = activeSearch ? activeSearch.query : null
    const planDisabled = isEqual(currentQuery, mostRecentQuery)
    return (
      <ViewerContainer>
        <div style={{
          bottom: showPlanTripButton ? 55 : 0,
          left: 0,
          overflow: 'auto',
          paddingBottom: 15,
          position: 'absolute',
          right: 0,
          top: 0
        }}>
          <DefaultSearchForm />
          {!activeSearch && !showPlanTripButton && showUserSettings &&
            <UserSettings />
          }
          <div className='desktop-narrative-container'>
            <NarrativeRoutingResults />
          </div>
        </div>
        {showPlanTripButton &&
          <div
            className='white-fade'
            style={{
              bottom: 55,
              height: 15,
              left: 0,
              position: 'absolute',
              right: 10
            }} />
        }
        {showPlanTripButton &&
          <div className='bottom-fixed'>
            <PlanTripButton disabled={planDisabled} />
          </div>
        }
      </ViewerContainer>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const showUserSettings = getShowUserSettings(state)
  return {
    activeSearch: getActiveSearch(state),
    currentQuery: state.otp.currentQuery,
    mainPanelContent: state.otp.ui.mainPanelContent,
    showUserSettings
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(DefaultMainPanel)
