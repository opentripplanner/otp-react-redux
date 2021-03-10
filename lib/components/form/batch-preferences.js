// import {DropdownSelector} from '@opentripplanner/trip-form'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'
import { ComponentContext } from '../../util/contexts'
import { getShowUserSettings } from '../../util/state'

import { StyledBatchPreferences } from './batch-styled'
import UserTripSettings from './user-trip-settings'

class BatchPreferences extends Component {
  static contextType = ComponentContext

  render () {
    const {
      config,
      query,
      setQueryParam,
      showUserSettings
    } = this.props
    const { ModeIcon } = this.context

    return (
      <div className='settings-selector-panel'>
        <div className='modes-panel'>
          {showUserSettings && <UserTripSettings />}

          <StyledBatchPreferences
            ModeIcon={ModeIcon}
            queryParams={query}
            supportedModes={config.modes}
            supportedCompanies={config.companies}
            onQueryParamChange={setQueryParam}
          />
          {/*
            FIXME: use these instead? They're currently cut off by the short
            height of the container.
          <DropdownSelector
            name='walkSpeed'
            style={{ display: 'inline-block', width: '250px' }}
            label='Walk speed:'
            options={[
              {
                text: 'Run! (5.6 mph)',
                value: 2.5
              },
              {
                text: 'Quicker (4 mph)',
                value: 1.788
              },
              {
                text: 'Average (3 mph)',
                value: 1.34
              },
              {
                text: 'Slower (2 mph)',
                value: 0.90
              }
            ]}
            onChange={setQueryParam}
            value={query.walkSpeed}
          />
          <DropdownSelector
            name='bikeSpeed'
            style={{ display: 'inline-block', width: '250px' }}
            label='Bike speed:'
            options={[
              {
                text: 'Run! (5.6 mph)',
                value: 2.5
              },
              {
                text: 'Quicker (4 mph)',
                value: 1.788
              },
              {
                text: 'Average (3 mph)',
                value: 1.34
              },
              {
                text: 'Slower (2 mph)',
                value: 0.90
              }
            ]}
            onChange={setQueryParam}
            value={query.walkSpeed}
          />
        */}
        </div>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { config, currentQuery } = state.otp
  return {
    query: currentQuery,
    config,
    showUserSettings: getShowUserSettings(state.otp)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchPreferences)
