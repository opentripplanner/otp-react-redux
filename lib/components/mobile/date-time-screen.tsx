import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'

import * as uiActions from '../../actions/ui'
import { MobileScreens } from '../../actions/ui-constants'
import DateTimeModal from '../form/date-time-modal'
import PlanTripButton from '../form/plan-trip-button'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

interface Props {
  setMobileScreen: (screen: number) => void
}

const MobileDateTimeScreen = ({ setMobileScreen }: Props) => {
  const intl = useIntl()
  return (
    <MobileContainer>
      <MobileNavigationBar
        backScreen={MobileScreens.SEARCH_FORM}
        headerText={intl.formatMessage({
          id: 'components.DateTimeScreen.header'
        })}
        showBackButton
      />
      <main tabIndex={-1}>
        <div className="options-main-content mobile-padding">
          <DateTimeModal />
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

export default connect(null, mapDispatchToProps)(MobileDateTimeScreen)
