import React, { Component } from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash.isequal'

import ViewerContainer from '../viewers/viewer-container'
import DefaultSearchForm from '../form/default-search-form'
import PlanTripButton from '../form/plan-trip-button'
import NarrativeRoutingResults from '../narrative/narrative-routing-results'
import { getActiveSearch } from '../../util/state'

class DefaultMainPanel extends Component {
  render () {
    const { customIcons, itineraryClass, itineraryFooter, mainPanelContent, currentQuery, activeSearch } = this.props
    const showPlanTripButton = mainPanelContent === 'EDIT_DATETIME' || mainPanelContent === 'EDIT_SETTINGS'

    return (
      <ViewerContainer>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: showPlanTripButton ? 55 : 0, paddingBottom: 15, overflow: 'auto' }}>
          <DefaultSearchForm icons={customIcons} />
          <div className='desktop-narrative-container'>
            <NarrativeRoutingResults itineraryClass={itineraryClass} itineraryFooter={itineraryFooter} customIcons={customIcons} />
          </div>
        </div>
        {showPlanTripButton && <div style={{ position: 'absolute', left: 0, right: 20, bottom: 55, height: 15, backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))', zIndex: 100 }} />}
        {showPlanTripButton && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 55, padding: 10 }}>
          <PlanTripButton disabled={isEqual(currentQuery, activeSearch ? activeSearch.query : null)} />
        </div>}
      </ViewerContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    mainPanelContent: state.otp.ui.mainPanelContent,
    currentQuery: state.otp.currentQuery,
    activeSearch: getActiveSearch(state.otp)
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(DefaultMainPanel)
