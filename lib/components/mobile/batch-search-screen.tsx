import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
import { MobileScreens } from '../../actions/ui-constants'
import BatchSettings from '../form/batch-settings'
import DefaultMap from '../map/default-map'
import LocationField from '../form/connected-location-field'
import SwitchButton from '../form/switch-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

const { SET_DATETIME, SET_FROM_LOCATION, SET_TO_LOCATION } = MobileScreens

interface Props {
  map: React.ReactElement
  setMobileScreen: (screen: number) => void
}

class BatchSearchScreen extends Component<Props> {
  _fromFieldClicked = () => this.props.setMobileScreen(SET_FROM_LOCATION)

  _toFieldClicked = () => this.props.setMobileScreen(SET_TO_LOCATION)

  _expandDateTimeClicked = () => this.props.setMobileScreen(SET_DATETIME)

  render() {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={
            <FormattedMessage id="components.BatchSearchScreen.header" />
          }
        />
        <main tabIndex={-1}>
          <div className="batch-search-settings mobile-padding">
            <LocationField
              locationType="from"
              onTextInputClick={this._fromFieldClicked}
              showClearButton={false}
            />
            <LocationField
              locationType="to"
              onTextInputClick={this._toFieldClicked}
              showClearButton={false}
            />
            <div className="switch-button-container-mobile">
              <SwitchButton />
            </div>
            <BatchSettings />
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

export default connect(null, mapDispatchToProps)(BatchSearchScreen)
