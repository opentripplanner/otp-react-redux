import { Close } from '@styled-icons/fa-solid'
import { useIntl } from 'react-intl'

import PageTitle from '../util/page-title'
import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'

const panelFlyIn = keyframes`
  0% { left: 100%; }
 100% { left: 0 }
`

const PanelOverlay = styled.div<{ reverseAnimation: boolean }>`
  left: 0;
  top: 0;
  height: 100vh;
  width: 100%;
  position: absolute;
  animation: ${panelFlyIn} 400ms ease-in forwards;
  animation-direction: ${(props) => props.reverseAnimation && 'reverse'};
  z-index: 100;
  background: white;
  padding: 1.5em;
  box-shadow: 3px 0px 12px #00000052;
`

const CloseButton = styled.button`
  border: none;
  background: transparent;
`

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    </PanelOverlay>
  )
}

export default AdvancedSettingsPanel
