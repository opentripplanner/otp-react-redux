import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import React, { Component, FormEvent } from 'react'

import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { getPersistenceMode } from '../../util/user'
import { PANEL_ANIMATION_TIMING } from '../form/styled'
import AdvancedSettingsPanel from '../form/advanced-settings-panel'
import BatchSettings from '../form/batch-settings'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import LocationField from '../form/connected-location-field'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import styled, { css, keyframes } from 'styled-components'

import SwitchButton from '../form/switch-button'
import UserSettings from '../form/user-settings'
import ViewerContainer from '../viewers/viewer-container'

interface Props {
  activeSearch: any
  intl: IntlShape
  mainPanelContent: number
  mobile?: boolean
  showUserSettings: boolean
}

const wipeLeft = keyframes`
  0% { transform: translateX(0); opacity: 100%;}
  55% { opacity: 0% }
  100% { transform: translateX(-75px); opacity: 0%;}
`

const animationString = css`
  animation: ${wipeLeft} ${PANEL_ANIMATION_TIMING}ms linear forwards;
`

const WipeLeftContent = styled.div<{ fade: boolean; reverse: boolean }>`
  ${(props) => props.fade && animationString};
  animation-direction: ${(props) => props.reverse && 'reverse'};
  height: 100%;
`

/**
 * Main panel for the batch/trip comparison form.
 */
class BatchRoutingPanel extends Component<Props> {
  state = {
    fade: false,
    planTripClicked: false,
    reverse: false,
    showAdvancedModeSettings: false
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    // Close the advanced mode settings if we navigate to another page
    if (
      prevProps.mainPanelContent === null &&
      this.props.mainPanelContent !== null &&
      this.state.showAdvancedModeSettings
    ) {
      this.setState({ fade: false, showAdvancedModeSettings: false })
    }
  }

  handleSubmit = (e: FormEvent) => e.preventDefault()

  handlePlanTripClick = () => {
    this.setState({ planTripClicked: true })
  }

  handleOpenAdvanceSettings = () => {
    this.setState({ showAdvancedModeSettings: true })
    // Allow Advanced Settings panel to finish animation before removing form from DOM
    setTimeout(() => {
      this.setState({ fade: true })
    }, PANEL_ANIMATION_TIMING)
  }

  handleCloseAdvanceSettings = () => {
    this.setState({ fade: false, reverse: true })
    // Allow Advanced Settings panel to finish animation before removing from DOM
    setTimeout(() => {
      this.setState({ reverse: false, showAdvancedModeSettings: false })
    }, PANEL_ANIMATION_TIMING)
  }

  render() {
    const { activeSearch, intl, mobile, showUserSettings } = this.props
    const { planTripClicked } = this.state
    const mapAction = mobile
      ? intl.formatMessage({
          id: 'common.searchForms.tap'
        })
      : intl.formatMessage({
          id: 'common.searchForms.click'
        })

    const reverseKey = !this.state.fade && this.state.reverse ? 'reverse' : ''

    return (
      <ViewerContainer
        className="batch-routing-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <InvisibleA11yLabel>
          <h1>
            <FormattedMessage id="components.BatchSearchScreen.header" />
          </h1>
        </InvisibleA11yLabel>
        <form
          className="form"
          onSubmit={this.handleSubmit}
          style={{ padding: '10px' }}
        >
          {this.state.showAdvancedModeSettings && (
            <AdvancedSettingsPanel
              closeAdvancedSettings={this.handleCloseAdvanceSettings}
            />
          )}
          {!this.state.fade && (
            <WipeLeftContent
              fade={this.state.showAdvancedModeSettings}
              key={`location-field-${reverseKey}`}
              reverse={this.state.reverse}
            >
              <span className="batch-routing-panel-location-fields">
                <LocationField
                  inputPlaceholder={intl.formatMessage(
                    { id: 'common.searchForms.enterStartLocation' },
                    { mapAction }
                  )}
                  isRequired
                  locationType="from"
                  selfValidate={planTripClicked}
                  showClearButton={!mobile}
                />
                <LocationField
                  inputPlaceholder={intl.formatMessage(
                    { id: 'common.searchForms.enterDestination' },
                    { mapAction }
                  )}
                  isRequired
                  locationType="to"
                  selfValidate={planTripClicked}
                  showClearButton={!mobile}
                />
                <div className="switch-button-container">
                  <SwitchButton />
                </div>
              </span>
              <BatchSettings
                onPlanTripClick={this.handlePlanTripClick}
                openAdvancedSettings={this.handleOpenAdvanceSettings}
              />
            </WipeLeftContent>
          )}
        </form>
        {!this.state.fade && (
          <WipeLeftContent
            fade={this.state.showAdvancedModeSettings}
            key={`user-settings-${reverseKey}`}
            reverse={this.state.reverse}
          >
            {!activeSearch && showUserSettings && (
              <UserSettings style={{ margin: '0 10px', overflowY: 'auto' }} />
            )}

            <div
              className="desktop-narrative-container"
              style={{
                flexGrow: 1,
                height: '100%',
                overflowY: 'hidden'
              }}
            >
              <NarrativeItineraries />
            </div>
          </WipeLeftContent>
        )}
      </ViewerContainer>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state: any) => {
  // Show the place shortcuts for OTP-middleware users who have accepted the terms of use
  // and deployments using persistence to localStorage. Don't show shortcuts otherwise.
  const showUserSettings =
    getShowUserSettings(state) &&
    (state.user.loggedInUser?.hasConsentedToTerms ||
      getPersistenceMode(state.otp.config.persistence).isLocalStorage)
  const { mainPanelContent } = state.otp.ui

  return {
    activeSearch: getActiveSearch(state),
    mainPanelContent,
    showUserSettings
  }
}

export default connect(mapStateToProps)(injectIntl(BatchRoutingPanel))
