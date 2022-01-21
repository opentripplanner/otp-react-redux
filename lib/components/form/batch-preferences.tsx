// Typescript TODO: these types are a bit useless without types for config, query, and queryparam
/* eslint-disable @typescript-eslint/no-explicit-any */
// import {DropdownSelector} from '@opentripplanner/trip-form'
import { connect } from 'react-redux'
import React, { Component } from 'react'

import { ComponentContext } from '../../util/contexts'
import { getShowUserSettings } from '../../util/state'
import { setQueryParam } from '../../actions/form'

import { StyledBatchPreferences } from './batch-styled'
import UserTripSettings from './user-trip-settings'

class BatchPreferences extends Component<{
  config: any
  query: any
  setQueryParam: (newQueryParam: any) => void
  showUserSettings: boolean
}> {
  static contextType = ComponentContext

  /**
   * When the queryParam changes, the mode is correctly updated but the
   * active combinations are not. This method updates the currentQuery combinations
   * and ensures that they all contain the correct modes
   *
   * Typescript TODO: combinations and queryParams need types
   */
  onQueryParamChange = (newQueryParams: any) => {
    const { config, setQueryParam } = this.props
    const combinations = config.modes.combinations.map(
      (combination: {
        mode: string
        params?: { [key: string]: number | string }
      }) => {
        // Split out walk so it's not duplicated
        const newMode = newQueryParams.mode.split('WALK,')[1]
        // Replace TRANSIT with the newly selected parameters
        const mode = combination.mode.replace('TRANSIT', newMode)
        return { ...combination, mode }
      }
    )
    setQueryParam({ ...newQueryParams, combinations })
  }

  render() {
    const { config, query, showUserSettings } = this.props
    const { ModeIcon } = this.context

    return (
      <div className="settings-selector-panel">
        <div className="modes-panel">
          {showUserSettings && <UserTripSettings />}

          <StyledBatchPreferences
            ModeIcon={ModeIcon}
            onQueryParamChange={this.onQueryParamChange}
            queryParams={query}
            supportedCompanies={config.companies}
            supportedModes={config.modes}
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

const mapStateToProps = (state: {
  otp: { config: any; currentQuery: any }
}) => {
  const { config, currentQuery } = state.otp
  return {
    config,
    query: currentQuery,
    showUserSettings: getShowUserSettings(state)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchPreferences)
