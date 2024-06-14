import { Close } from '@styled-icons/fa-solid'
import { FocusTrapWrapper } from '@opentripplanner/map-popup/lib'
import { FormattedMessage, useIntl } from 'react-intl'

import PageTitle from '../util/page-title'
import React, { RefObject } from 'react'
import styled from 'styled-components'

const PanelOverlay = styled.div`
  height: 100vh;
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
  closeAdvancedSettings,
  innerRef
}: {
  closeAdvancedSettings: () => void
  innerRef: RefObject<HTMLDivElement>
}): JSX.Element => {
  const intl = useIntl()
  const closeButtonText = intl.formatMessage({
    id: 'components.BatchSearchScreen.closeAdvancedPreferences'
  })
  const headerText = intl.formatMessage({
    id: 'components.BatchSearchScreen.advancedHeader'
  })

  const closePanel = () => {
    closeAdvancedSettings()
  }

  return (
    <PanelOverlay className="advanced-settings" ref={innerRef}>
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
