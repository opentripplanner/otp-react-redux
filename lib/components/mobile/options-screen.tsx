import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React, { useCallback } from 'react'

import * as uiActions from '../../actions/ui'
import ConnectedSettingsSelectorPanel from '../form/connected-settings-selector-panel'
import PlanTripButton from '../form/plan-trip-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

type Props = {
  setMobileScreen: (screen: number) => void
}

const MobileOptionsScreen = ({ setMobileScreen }: Props) => (
  <MobileContainer>
    <MobileNavigationBar
      backScreen={uiActions.MobileScreens.SEARCH_FORM}
      headerText={<FormattedMessage id="components.MobileOptions.header" />}
    />
    <main tabIndex={-1}>
      <div className="options-main-content mobile-padding">
        <ConnectedSettingsSelectorPanel />
      </div>

      <div className="options-lower-tray mobile-padding">
        <PlanTripButton
          onClick={useCallback(
            () => setMobileScreen(uiActions.MobileScreens.RESULTS_SUMMARY),
            [setMobileScreen]
          )}
        />
      </div>
    </main>
  </MobileContainer>
)

// connect to the redux store

const mapDispatchToProps = {
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(null, mapDispatchToProps)(MobileOptionsScreen)
