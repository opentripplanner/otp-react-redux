import { connect } from 'react-redux'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { injectIntl, IntlShape } from 'react-intl'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import {
  advancedPanelClassName,
  mainPanelClassName,
  transitionDuration,
  TransitionStyles
} from '../form/styled'
import { alertUserTripPlan } from '../form/util'
import { MobileScreens } from '../../actions/ui-constants'
import AdvancedSettingsPanel from '../form/advanced-settings-panel'
import BatchSettings from '../form/batch-settings'
import DefaultMap from '../map/default-map'
import LocationField from '../form/connected-location-field'
import SwitchButton from '../form/switch-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

const { SET_FROM_LOCATION, SET_TO_LOCATION } = MobileScreens

const MobileSearchSettings = styled.div<{
  advancedPanelOpen: boolean
  transitionDelay: number
  transitionDuration: number
}>`
  background: white;
  box-shadow: 3px 0px 12px #00000052;
  height: ${(props) =>
    props.advancedPanelOpen ? 'calc(100% - 50px)' : '230px'};
  left: 0;
  position: fixed;
  right: 0;
  top: 50px;
  transition: ${(props) => `all ${props.transitionDuration}ms ease`};
  transition-delay: ${(props) => props.transitionDelay}ms;
  /* Must appear under the 'hamburger' dropdown which has z-index of 1000. */
  z-index: 999;
`

interface Props {
  currentQuery: any
  intl: IntlShape
  map: React.ReactElement
  routingQuery: any
  setMobileScreen: (screen: number) => void
}

class BatchSearchScreen extends Component<Props> {
  state = {
    closeAdvancedSettingsWithDelay: false,
    planTripClicked: false,
    showAdvancedModeSettings: false
  }

  _fromFieldClicked = () => this.props.setMobileScreen(SET_FROM_LOCATION)

  _toFieldClicked = () => this.props.setMobileScreen(SET_TO_LOCATION)

  _mainPanelContentRef = React.createRef<HTMLDivElement>()
  _advancedSettingRef = React.createRef<HTMLDivElement>()

  handlePlanTripClick = () => {
    const { currentQuery, intl, routingQuery } = this.props
    alertUserTripPlan(intl, currentQuery, routingQuery, () =>
      this.setState({ planTripClicked: true })
    )
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

  render() {
    const { intl } = this.props
    const { planTripClicked, showAdvancedModeSettings } = this.state

    const transitionDelay = this.state.closeAdvancedSettingsWithDelay ? 300 : 0
    const transitionDurationWithDelay = transitionDuration + transitionDelay
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={intl.formatMessage({
            id: 'components.BatchSearchScreen.header'
          })}
        />
        <main tabIndex={-1}>
          <MobileSearchSettings
            advancedPanelOpen={showAdvancedModeSettings}
            className={`batch-search-settings mobile-padding ${
              showAdvancedModeSettings && 'advanced-mode-open'
            }`}
            transitionDelay={transitionDelay}
            transitionDuration={transitionDuration}
          >
            <TransitionStyles transitionDelay={transitionDelay}>
              <TransitionGroup style={{ display: 'content' }}>
                {/* Unfortunately we can't use a ternary operator here because it is cancelling out the CSSTransition animations. */}
                {!showAdvancedModeSettings && (
                  <CSSTransition
                    classNames={mainPanelClassName}
                    nodeRef={this._mainPanelContentRef}
                    timeout={transitionDurationWithDelay}
                  >
                    <div
                      ref={this._mainPanelContentRef}
                      style={{ display: 'content' }}
                    >
                      <LocationField
                        inputPlaceholder={intl.formatMessage({
                          id: 'components.LocationSearch.setOrigin'
                        })}
                        isRequired
                        locationType="from"
                        onTextInputClick={this._fromFieldClicked}
                        selfValidate={planTripClicked}
                        showClearButton={false}
                      />
                      <LocationField
                        inputPlaceholder={intl.formatMessage({
                          id: 'components.LocationSearch.setDestination'
                        })}
                        isRequired
                        locationType="to"
                        onTextInputClick={this._toFieldClicked}
                        selfValidate={planTripClicked}
                        showClearButton={false}
                      />
                      <div className="switch-button-container-mobile">
                        <SwitchButton />
                      </div>
                      <BatchSettings
                        onPlanTripClick={this.handlePlanTripClick}
                        openAdvancedSettings={this.openAdvancedSettings}
                      />
                    </div>
                  </CSSTransition>
                )}
                {showAdvancedModeSettings && (
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
              </TransitionGroup>
            </TransitionStyles>
          </MobileSearchSettings>
          <div className="batch-search-map">
            <DefaultMap />
          </div>
        </main>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: any) => {
  const { currentQuery } = state.otp.currentQuery
  return {
    currentQuery
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BatchSearchScreen))
