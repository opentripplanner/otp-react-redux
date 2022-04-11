// Typescript TODO: these types are a bit useless without types for config, query, and queryparam
/* eslint-disable @typescript-eslint/no-explicit-any */
// import {DropdownSelector} from '@opentripplanner/trip-form'
import { connect } from 'react-redux'
import React, { Component } from 'react'

import { ComponentContext } from '../../util/contexts'
import { setQueryParam } from '../../actions/form'

import { combinationFilter } from './batch-settings'
import { defaultModeOptions, Mode } from './mode-buttons'
import { StyledBatchPreferences } from './batch-styled'

// TODO: Central type source
export type Combination = {
  mode: string
  params?: { [key: string]: number | string }
  requiredModes?: string[]
}

export const replaceTransitMode =
  (newQueryParamsMode: string) =>
  (combination: Combination): Combination => {
    // Split out walk so it's not duplicated
    const newMode = (newQueryParamsMode || 'WALK,TRANSIT').split('WALK,')?.[1]
    // Replace TRANSIT with the newly selected parameters
    const mode = combination.mode.replace('TRANSIT', newMode)
    return { ...combination, mode }
  }

class BatchPreferences extends Component<{
  config: any
  modeOptions: Mode[]
  query: any
  setQueryParam: (newQueryParam: any) => void
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
    const { config, modeOptions, query, setQueryParam } = this.props
    const enabledModes = query.enabledModes || modeOptions
    const combinations = config.modes.combinations
      .filter(combinationFilter(enabledModes))
      .map(replaceTransitMode(newQueryParams.mode))
    setQueryParam({ ...newQueryParams, combinations })
  }

  render() {
    const { config, query } = this.props
    const { ModeIcon } = this.context

    return (
      <div className="settings-selector-panel">
        <div className="modes-panel">
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
    modeOptions: config.modes.modeOptions || defaultModeOptions,
    query: currentQuery
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchPreferences)
