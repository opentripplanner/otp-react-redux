import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
import { MobileScreens } from '../../actions/ui-constants'
import { PANEL_ANIMATION_TIMING } from '../form/styled'
import AdvancedSettingsPanel from '../form/advanced-settings-panel'
import BatchSettings from '../form/batch-settings'
import DefaultMap from '../map/default-map'
import LocationField from '../form/connected-location-field'
import SwitchButton from '../form/switch-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

const { SET_FROM_LOCATION, SET_TO_LOCATION } = MobileScreens

interface Props {
  intl: IntlShape
  map: React.ReactElement
  setMobileScreen: (screen: number) => void
}

class BatchSearchScreen extends Component<Props> {
  state = {
    fade: false,
    planTripClicked: false,
    showAdvancedModeSettings: false
  }

  _fromFieldClicked = () => this.props.setMobileScreen(SET_FROM_LOCATION)

  _toFieldClicked = () => this.props.setMobileScreen(SET_TO_LOCATION)

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
    this.setState({ fade: false })
    // Allow Advanced Settings panel to finish animation before removing from DOM
    setTimeout(() => {
      this.setState({ showAdvancedModeSettings: false })
    }, PANEL_ANIMATION_TIMING)
  }

  render() {
    const { intl } = this.props
    const { planTripClicked } = this.state
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={intl.formatMessage({
            id: 'components.BatchSearchScreen.header'
          })}
        />
        <main tabIndex={-1}>
          <div className="batch-search-settings mobile-padding">
            {!this.state.fade && (
              <>
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
                  openAdvancedSettings={this.handleOpenAdvanceSettings}
                />
              </>
            )}

            {this.state.showAdvancedModeSettings && (
              <AdvancedSettingsPanel
                closeAdvancedSettings={this.handleCloseAdvanceSettings}
              />
            )}
          </div>
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
