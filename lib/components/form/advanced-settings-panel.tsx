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
import {
  ModeButtonDefinition,
  ModeSetting,
  ModeSettingValues
} from '@opentripplanner/types'
import React, { useContext, useState } from 'react'
import styled, { keyframes } from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'

import {
  addCustomSettingLabels,
  addModeButtonIcon,
  pipe,
  populateSettingWithIcon
} from './util'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import { generateModeSettingValues } from '../../util/api'
import { PANEL_ANIMATION_TIMING } from './styled'
import { setModeButtonEnabled } from './batch-settings'
import PageTitle from '../util/page-title'

const panelFlyIn = keyframes`
  0% { left: 75px; opacity: 0 }
  45% { opacity: 0}
 100% { left: 0; opacity: 100% }
`

const PanelOverlay = styled.div<{ reverseAnimation: boolean }>`
  animation: ${panelFlyIn} ${PANEL_ANIMATION_TIMING}ms linear forwards;
  animation-direction: ${(props) => props.reverseAnimation && 'reverse'};
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
  closeAdvancedSettings,
  enabledModeButtons,
  modeButtonOptions,
  modeSettingDefinitions,
  modeSettingValues,
  setQueryParam
}: {
  closeAdvancedSettings: () => void
  enabledModeButtons: string[]
  modeButtonOptions: ModeButtonDefinition[]
  modeSettingDefinitions: ModeSetting[]
  modeSettingValues: ModeSettingValues
  setQueryParam: (evt: any) => void
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
