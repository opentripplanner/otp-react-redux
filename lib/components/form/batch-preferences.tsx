// Typescript TODO: these types are a bit useless without types for config, query, and queryparam
/* eslint-disable @typescript-eslint/no-explicit-any */
// import {DropdownSelector} from '@opentripplanner/trip-form'
import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
import React, { Component } from 'react'

import { ComponentContext } from '../../util/contexts'
import { getSupportedModes } from '../../util/i18n'
import { setQueryParam } from '../../actions/form'

import { defaultModeOptions, Mode } from './mode-buttons'
import { StyledBatchPreferences } from './batch-styled'

interface Props {
  config: any
  intl: IntlShape
  modeOptions: Mode[]
  query: any
  setQueryParam: (newQueryParam: any) => void
}

class BatchPreferences extends Component<Props> {
  static contextType = ComponentContext

  render() {
    const { config, intl, query } = this.props
    const { ModeIcon } = this.context

    return (
      <div className="settings-selector-panel">
        <div className="modes-panel">
          <StyledBatchPreferences
            ModeIcon={ModeIcon}
            queryParams={query}
            supportedCompanies={config.companies}
            supportedModes={getSupportedModes(config, intl)}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BatchPreferences))
