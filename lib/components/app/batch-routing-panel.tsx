import { connect } from 'react-redux'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import React, { Component, FormEvent } from 'react'

import * as apiActions from '../../actions/api'
import {
  advancedPanelClassName,
  mainPanelClassName,
  transitionDuration,
  TransitionStyles
} from '../form/styled'
import { alertUserTripPlan } from '../form/util'
import { getActiveSearch, getShowUserSettings } from '../../util/state'
import { getPersistenceMode } from '../../util/user'
import AdvancedSettingsPanel from '../form/advanced-settings-panel'
import BatchSettings from '../form/batch-settings'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import LocationField from '../form/connected-location-field'
import NarrativeItineraries from '../narrative/narrative-itineraries'
import SwitchButton from '../form/switch-button'
import UserSettings from '../form/user-settings'
import ViewerContainer from '../viewers/viewer-container'

interface Props {
  activeSearch: any
  currentQuery: any
  intl: IntlShape
  mainPanelContent: number
  mobile?: boolean
  routingQuery: () => void
  showUserSettings: boolean
}

/**
 * Main panel for the batch/trip comparison form.
 */
class BatchRoutingPanel extends Component<Props> {
  state = {
    closeAdvancedSettingsWithDelay: false,
    planTripClicked: false,
    showAdvancedModeSettings: false
  }

  _advancedSettingRef = React.createRef<HTMLDivElement>()
  _mainPanelContentRef = React.createRef<HTMLDivElement>()
  _itinerariesAndUserRef = React.createRef<HTMLDivElement>()

  componentDidUpdate(prevProps: Readonly<Props>): void {
    // Close the advanced mode settings if we navigate to another page
    if (
      prevProps.mainPanelContent === null &&
      this.props.mainPanelContent !== null &&
      this.state.showAdvancedModeSettings
    ) {
      this.setState({
        showAdvancedModeSettings: false
      })
    }
  }

  openAdvancedSettings = () => {
    this.setState({
      closeAdvancedSettingsWithDelay: false,
      showAdvancedModeSettings: true
    })
  }

  closeAdvancedSettings = () => {
    this.setState({ showAdvancedModeSettings: false })
  }

  setCloseAdvancedSettingsWithDelay = () => {
    this.setState({
      closeAdvancedSettingsWithDelay: true
    })
  }

  handleSubmit = (e: FormEvent) => e.preventDefault()

  handlePlanTripClick = () => {
    const { currentQuery, intl, routingQuery } = this.props
    alertUserTripPlan(
      intl,
      currentQuery,
      () => this.setState({ planTripClicked: true }),
      routingQuery
    )
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

    /* If there is a save button in advanced preferences, add a transition delay to allow
    the saved state to be displayed to users */
    const transitionDelay = this.state.closeAdvancedSettingsWithDelay ? 300 : 0
    const transitionDurationWithDelay = transitionDuration + transitionDelay

    return (
      <ViewerContainer
        className="batch-routing-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <TransitionStyles transitionDelay={transitionDelay}>
          {!this.state.showAdvancedModeSettings && (
            <InvisibleA11yLabel>
              <h1>
                <FormattedMessage id="components.BatchSearchScreen.header" />
              </h1>
            </InvisibleA11yLabel>
          )}
          <form
            className="form"
            onSubmit={this.handleSubmit}
            style={{ padding: '10px' }}
          >
            <TransitionGroup style={{ display: 'content' }}>
              {this.state.showAdvancedModeSettings && (
                <CSSTransition
                  classNames={advancedPanelClassName}
                  nodeRef={this._advancedSettingRef}
                  timeout={{
                    enter: transitionDuration,
                    exit: transitionDurationWithDelay
                  }}
                >
                  <AdvancedSettingsPanel
                    closeAdvancedSettings={this.closeAdvancedSettings}
                    handlePlanTrip={this.handlePlanTripClick}
                    innerRef={this._advancedSettingRef}
                    setCloseAdvancedSettingsWithDelay={
                      this.setCloseAdvancedSettingsWithDelay
                    }
                  />
                </CSSTransition>
              )}

              {!this.state.showAdvancedModeSettings && (
                <CSSTransition
                  classNames={mainPanelClassName}
                  nodeRef={this._mainPanelContentRef}
                  onExit={this.openAdvancedSettings}
                  timeout={transitionDurationWithDelay}
                >
                  <div ref={this._mainPanelContentRef}>
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
                      openAdvancedSettings={this.openAdvancedSettings}
                    />
                  </div>
                </CSSTransition>
              )}
            </TransitionGroup>
          </form>
          <TransitionGroup style={{ display: 'contents' }}>
            {!this.state.showAdvancedModeSettings && (
              <CSSTransition
                classNames={mainPanelClassName}
                nodeRef={this._itinerariesAndUserRef}
                timeout={transitionDurationWithDelay}
              >
                <div
                  ref={this._itinerariesAndUserRef}
                  style={{ height: '100%', overflowY: 'auto' }}
                >
                  {!activeSearch && showUserSettings && (
                    <UserSettings
                      style={{ margin: '0 10px', overflowY: 'auto' }}
                    />
                  )}
                  <div
                    className="desktop-narrative-container"
                    style={{
                      flexGrow: 1,
                      height: activeSearch ? '100%' : 'auto',
                      overflowY: 'hidden'
                    }}
                  >
                    <NarrativeItineraries />
                  </div>
                </div>
              </CSSTransition>
            )}
          </TransitionGroup>
        </TransitionStyles>
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
  const currentQuery = state.otp.currentQuery

  return {
    activeSearch: getActiveSearch(state),
    currentQuery,
    mainPanelContent,
    showUserSettings
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BatchRoutingPanel))
