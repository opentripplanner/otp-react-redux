import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'
import { getShowUserSettings } from '../../util/state'

import { StyledSettingsSelectorPanel } from './styled'
import UserTripSettings from './user-trip-settings'

// TODO: Button title should be bold when button is selected.

class ConnectedSettingsSelectorPanel extends Component {
  static propTypes = {
    icons: PropTypes.object
  }

  render () {
    const {
      config,
      icons,
      query,
      setQueryParam,
      showUserSettings
    } = this.props

    return (
      <div className='settings-selector-panel'>
        <div className='modes-panel'>
          {showUserSettings && <UserTripSettings />}

          <StyledSettingsSelectorPanel
            className='settings-selector-panel'
            icons={icons}
            queryParams={query}
            supportedModes={config.modes}
            supportedCompanies={config.companies}
            onQueryParamChange={setQueryParam}
          />
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

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedSettingsSelectorPanel)
