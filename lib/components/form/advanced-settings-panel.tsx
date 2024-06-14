import {
  addSettingsToButton,
  AdvancedModeSubsettingsContainer,
  populateSettingWithValue
} from '@opentripplanner/trip-form'
import { Close } from '@styled-icons/fa-solid'
import { connect } from 'react-redux'
import { decodeQueryParams, DelimitedArrayParam } from 'serialize-query-params'
import { FocusTrapWrapper } from '@opentripplanner/map-popup/lib'
import { FormattedMessage, useIntl } from 'react-intl'

import PageTitle from '../util/page-title'
import React from 'react'
import styled, { keyframes } from 'styled-components'

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
  closeAdvancedSettings
}: {
  closeAdvancedSettings: () => void
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

  // @ts-expect-error Context not typed
  const { ModeIcon } = useContext(ComponentContext)

  const processedModeSettings = modeSettingDefinitions.map(
    pipe(
      populateSettingWithIcon(ModeIcon),
      populateSettingWithValue(modeSettingValues),
      addCustomSettingLabels(intl)
    )
  )

  const processedModeButtons = modeButtonOptions.map(
    pipe(
      addModeButtonIcon(ModeIcon),
      addSettingsToButton(processedModeSettings),
      setModeButtonEnabled(enabledModeButtons)
    )
  )

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
        <AdvancedModeSubsettingsContainer
          fillModeIcons
          label="test"
          modeButtons={processedModeButtons}
          onSettingsUpdate={setQueryParam}
          onToggleModeButton={setQueryParam}
        />
      </FocusTrapWrapper>
    </PanelOverlay>
  )
}

const queryParamConfig = { modeButtons: DelimitedArrayParam }

const mapStateToProps = (state: AppReduxState) => {
  const urlSearchParams = new URLSearchParams(state.router.location.search)
  const modeSettingValues = generateModeSettingValues(
    urlSearchParams,
    state.otp?.modeSettingDefinitions || [],
    state.otp.config.modes?.initialState?.modeSettingValues || {}
  )
  return {
    currentQuery: state.otp.currentQuery,
    // TODO: Duplicated in apiv2.js
    enabledModeButtons:
      decodeQueryParams(queryParamConfig, {
        modeButtons: urlSearchParams.get('modeButtons')
      })?.modeButtons?.filter((mb): mb is string => mb !== null) ||
      state.otp.config?.modes?.initialState?.enabledModeButtons ||
      [],
    modeButtonOptions: state.otp.config?.modes?.modeButtons || [],
    modeSettingDefinitions: state.otp?.modeSettingDefinitions || [],
    modeSettingValues
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam,
  updateQueryTimeIfLeavingNow: formActions.updateQueryTimeIfLeavingNow
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdvancedSettingsPanel)
