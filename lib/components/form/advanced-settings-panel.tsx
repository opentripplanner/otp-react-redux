import { Close } from '@styled-icons/fa-solid'
import { FocusTrapWrapper } from '@opentripplanner/map-popup/lib'
import { FormattedMessage, useIntl } from 'react-intl'

import { PANEL_ANIMATION_TIMING } from './styled'
import PageTitle from '../util/page-title'
import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'

const panelFlyIn = keyframes`
  0% { left: 100%; opacity: 25% }
 100% { left: 0; opacity: 100% }
`

const PanelOverlay = styled.div<{ reverseAnimation: boolean }>`
  animation: ${panelFlyIn} ${PANEL_ANIMATION_TIMING}ms ease-in-out forwards;
  animation-direction: ${(props) => props.reverseAnimation && 'reverse'};
  background: white;
  box-shadow: 3px 0px 12px #00000052;
  height: 100vh;
  left: 0;
  padding: 1.5em;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
`

const HeaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const AdvancedSettingsPanel = ({
  closeAdvancedSettings
}: {
  closeAdvancedSettings: () => void
}): JSX.Element => {
  const [reverseAnimation, setReverseAnimation] = useState(false)
  const intl = useIntl()
  const key = reverseAnimation.toString()
  const closeButtonText = intl.formatMessage({
    id: 'components.BatchSearchScreen.closeAdvancedPreferences'
  })
  const headerText = intl.formatMessage({
    id: 'components.BatchSearchScreen.advancedHeader'
  })

  const closePanel = () => {
    closeAdvancedSettings()
    setReverseAnimation(true)
  }

  return (
    <PanelOverlay
      className="advanced-settings"
      key={key}
      reverseAnimation={reverseAnimation}
    >
      <FocusTrapWrapper closePopup={closePanel} id="advanced-settings">
        <HeaderContainer>
          <h1 className="header-text">{headerText}</h1>
          <CloseButton
            aria-label={closeButtonText}
            onClick={closePanel}
            title={closeButtonText}
          >
            <Close size={22} />
          </CloseButton>
        </HeaderContainer>
        <PageTitle title={headerText} />
        {/**
         * Date time selector goes here
         */}
        <h2 className="header-text">
          <FormattedMessage id="components.BatchSearchScreen.tripOptions" />
        </h2>
        {/**
         * Trip options (walk speed, walk reluctance, accessible routing) go here
         */}
        <h2 className="header-text">
          <FormattedMessage id="components.BatchSearchScreen.modeOptions" />
        </h2>
        {/**
         * AdvancedModeSubsettingsContainer (import from Otp-ui) goes here
         */}
      </FocusTrapWrapper>
    </PanelOverlay>
  )
}

export default AdvancedSettingsPanel
