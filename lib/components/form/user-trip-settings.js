/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Lock } from '@styled-icons/fa-solid/Lock'
import { Times } from '@styled-icons/fa-solid/Times'
import { Undo } from '@styled-icons/fa-solid/Undo'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'

import {
  clearDefaultSettings,
  resetForm,
  storeDefaultSettings
} from '../../actions/form'
import StyledIconWrapper from '../util/styledIcon'

/**
 * This component contains the `Remember/Forget my trip options` and `Restore defaults` commands
 * that let the user save the selected trip settings such as mode choices,
 * walk/bike distance and speed, and trip optimization flags.
 * (The code below was previously embedded inside the `SettingsSelectorPanel` component.)
 */
class UserTripSettings extends Component {
  _toggleStoredSettings = () => {
    const options = coreUtils.query.getTripOptionsFromQuery(this.props.query)
    // If user defaults are set, clear them. Otherwise, store them.
    if (this.props.defaults) this.props.clearDefaultSettings()
    else this.props.storeDefaultSettings(options)
  }

  render() {
    const { config, defaults, query, resetForm } = this.props

    // Do not permit remembering trip options if they do not differ from the
    // defaults and nothing has been stored
    const queryIsDefault = !coreUtils.query.isNotDefaultQuery(query, config)
    const rememberIsDisabled = queryIsDefault && !defaults

    return (
      <div
        className="store-settings pull-right"
        style={{ marginBottom: '5px' }}
      >
        <Button
          bsSize="xsmall"
          bsStyle="link"
          disabled={rememberIsDisabled}
          onClick={this._toggleStoredSettings}
        >
          {defaults ? (
            <span>
              <StyledIconWrapper spaceRight>
                <Times />
              </StyledIconWrapper>
              <FormattedMessage id="components.UserTripSettings.forgetOptions" />
            </span>
          ) : (
            <span>
              <StyledIconWrapper spaceRight>
                <Lock />
              </StyledIconWrapper>
              <FormattedMessage id="components.UserTripSettings.rememberOptions" />
            </span>
          )}
        </Button>
        <Button
          bsSize="xsmall"
          bsStyle="link"
          disabled={queryIsDefault && !defaults}
          onClick={resetForm}
        >
          <StyledIconWrapper spaceRight>
            <Undo />
          </StyledIconWrapper>
          <FormattedMessage
            id="components.UserTripSettings.restoreOptions"
            values={{ defaults }}
          />
        </Button>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state) => {
  const { config, currentQuery } = state.otp
  const { defaults } = state.user.localUser

  return {
    config,
    defaults,
    query: currentQuery
  }
}

const mapDispatchToProps = {
  clearDefaultSettings,
  resetForm,
  storeDefaultSettings
}

export default connect(mapStateToProps, mapDispatchToProps)(UserTripSettings)
