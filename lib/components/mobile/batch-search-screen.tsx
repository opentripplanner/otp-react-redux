import { connect } from 'react-redux'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { injectIntl, IntlShape } from 'react-intl'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import {
  advancedPanelClassName,
  mainPanelClassName,
  transitionDuration,
  TransitionStyles
} from '../form/styled'
import { MobileScreens } from '../../actions/ui-constants'
import AdvancedSettingsPanel from '../form/advanced-settings-panel'
import BatchSettings from '../form/batch-settings'
import DefaultMap from '../map/default-map'
import LocationField from '../form/connected-location-field'
import SwitchButton from '../form/switch-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

const { SET_FROM_LOCATION, SET_TO_LOCATION } = MobileScreens

const MobileSearchSettings = styled.div<{ advancedPanelOpen: boolean }>`
  background: white;
  box-shadow: 3px 0px 12px #00000052;
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  transition: all 200ms ease;
  height: ${(props) =>
    props.advancedPanelOpen ? 'calc(100% - 50px)' : '230px'};
  /* Must appear under the 'hamburger' dropdown which has z-index of 1000. */
  z-index: 999;
`

interface Props {
  intl: IntlShape
  map: React.ReactElement
  setMobileScreen: (screen: number) => void
}

class BatchSearchScreen extends Component<Props> {
  state = {
    planTripClicked: false,
    showAdvancedModeSettings: false
  }

  _fromFieldClicked = () => this.props.setMobileScreen(SET_FROM_LOCATION)

  _toFieldClicked = () => this.props.setMobileScreen(SET_TO_LOCATION)

  _mainPanelContentRef = React.createRef<HTMLDivElement>()
  _advancedSettingRef = React.createRef<HTMLDivElement>()

  handlePlanTripClick = () => {
    this.setState({ planTripClicked: true })
  }

  render() {
    const { intl } = this.props
    const { planTripClicked, showAdvancedModeSettings } = this.state
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
          >
            <TransitionStyles>
              <TransitionGroup style={{ display: 'content' }}>
                {!showAdvancedModeSettings && (
                  <CSSTransition
                    classNames={mainPanelClassName}
                    nodeRef={this._mainPanelContentRef}
                    timeout={transitionDuration}
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
                        openAdvancedSettings={
                          () =>
                            this.setState({ showAdvancedModeSettings: true })
                          // eslint-disable-next-line react/jsx-curly-newline
                        }
                      />
                    </div>
                  </CSSTransition>
                )}
                {showAdvancedModeSettings && (
                  <CSSTransition
                    classNames={advancedPanelClassName}
                    nodeRef={this._advancedSettingRef}
                    timeout={transitionDuration}
                  >
                    <AdvancedSettingsPanel
                      closeAdvancedSettings={
                        () => this.setState({ showAdvancedModeSettings: false })
                        // eslint-disable-next-line prettier/prettier
                      }
                      innerRef={this._advancedSettingRef}
                      onPlanTripClick={this.handlePlanTripClick}
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

const mapDispatchToProps = {
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(null, mapDispatchToProps)(injectIntl(BatchSearchScreen))
