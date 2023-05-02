import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'

import * as uiActions from '../../actions/ui'
import { MobileScreens } from '../../actions/ui-constants'
import ConnectedSettingsSelectorPanel from '../form/connected-settings-selector-panel'
import PlanTripButton from '../form/plan-trip-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

type Props = {
  setMobileScreen: (screen: number) => void
}

const MobileOptionsScreen = ({ setMobileScreen }: Props) => {
  const intl = useIntl()
  return (
    <MobileContainer>
      <MobileNavigationBar
        backScreen={MobileScreens.SEARCH_FORM}
        headerText={intl.formatMessage({
          id: 'components.MobileOptions.header'
        })}
      />
      <main tabIndex={-1}>
        <div className="options-main-content mobile-padding">
          <ConnectedSettingsSelectorPanel />
        </div>

        <div className="options-lower-tray mobile-padding">
          <PlanTripButton
            onClick={useCallback(
              () => setMobileScreen(MobileScreens.RESULTS_SUMMARY),
              [setMobileScreen]
            )}
          />
        </div>
      </main>
    </MobileContainer>
  )
}

// connect to the redux store

const mapDispatchToProps = {
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(null, mapDispatchToProps)(MobileOptionsScreen)
