import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'

import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { MobileScreens } from '../../actions/ui-constants'
import DefaultMap from '../map/default-map'
import LocationField from '../form/connected-location-field'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

interface Props {
  setMobileScreen: (screen: number) => void
}

const MobileWelcomeScreen = ({ setMobileScreen }: Props) => {
  const intl = useIntl()

  const toFieldClicked = useCallback(
    () => setMobileScreen(MobileScreens.SET_INITIAL_LOCATION),
    [setMobileScreen]
  )

  return (
    <MobileContainer>
      <MobileNavigationBar
        headerText={intl.formatMessage({
          id: 'components.BatchSearchScreen.header'
        })}
      />
      <main tabIndex={-1}>
        <div className="welcome-location mobile-padding">
          <LocationField
            inputPlaceholder={intl.formatMessage({
              id: 'components.WelcomeScreen.prompt'
            })}
            locationType="to"
            onTextInputClick={toFieldClicked}
            showClearButton={false}
          />
        </div>
        <div className="welcome-map">
          <DefaultMap />
        </div>
      </main>
    </MobileContainer>
  )
}

// connect to the redux store

const mapDispatchToProps = {
  setLocationToCurrent: mapActions.setLocationToCurrent,
  setMobileScreen: uiActions.setMobileScreen
}

export default connect(null, mapDispatchToProps)(MobileWelcomeScreen)
