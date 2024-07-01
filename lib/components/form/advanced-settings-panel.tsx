import {
  addSettingsToButton,
  AdvancedModeSubsettingsContainer,
  ModeSettingRenderer,
  populateSettingWithValue
} from '@opentripplanner/trip-form'

import { blue, getBaseColor } from '../util/colors'
import { Close } from '@styled-icons/fa-solid'

import { connect } from 'react-redux'
import { decodeQueryParams, DelimitedArrayParam } from 'serialize-query-params'
import { FormattedMessage, useIntl } from 'react-intl'

import { generateModeSettingValues } from '../../util/api'

import {
  ModeButtonDefinition,
  ModeSetting,
  ModeSettingValues
} from '@opentripplanner/types'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import PageTitle from '../util/page-title'

import React, { RefObject, useContext } from 'react'
import styled from 'styled-components'

import {
  addCustomSettingLabels,
  addModeButtonIcon,
  onSettingsUpdate,
  pipe,
  populateSettingWithIcon,
  setModeButton
} from './util'

import { invisibleCss } from '@opentripplanner/trip-form/lib/MetroModeSelector'

import { setModeButtonEnabled } from './batch-settings'
import { styledCheckboxCss } from './styled'

const PanelOverlay = styled.div`
  background-color: #fff;
  height: 100%;
  left: 0;
  padding: 1.5em;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
  overflow-y: scroll;
`

const GlobalSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 2em 0;

  ${styledCheckboxCss}
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

const Subheader = styled.h2`
  ${invisibleCss}
`
const baseColor = getBaseColor()
const accentColor = baseColor || blue[900]

const AdvancedSettingsPanel = ({
  closeAdvancedSettings,
  enabledModeButtons,
  innerRef,
  modeButtonOptions,
  modeSettingDefinitions,
  modeSettingValues,
  setQueryParam
}: {
  closeAdvancedSettings: () => void
  enabledModeButtons: string[]
  innerRef: RefObject<HTMLDivElement>
  modeButtonOptions: ModeButtonDefinition[]
  modeSettingDefinitions: ModeSetting[]
  modeSettingValues: ModeSettingValues
  setQueryParam: (evt: any) => void
}): JSX.Element => {
  const intl = useIntl()
  const closeButtonText = intl.formatMessage({
    id: 'components.BatchSearchScreen.closeAdvancedPreferences'
  })
  const headerText = intl.formatMessage({
    id: 'components.BatchSearchScreen.advancedHeader'
  })

  // @ts-expect-error Context not typed
  const { ModeIcon } = useContext(ComponentContext)

  const processSettings = (settings: ModeSetting[]) =>
    settings.map(
      pipe(
        populateSettingWithIcon(ModeIcon),
        populateSettingWithValue(modeSettingValues),
        addCustomSettingLabels(intl)
      )
    )

  const globalSettings = modeSettingDefinitions.filter((x) => !x.applicableMode)
  const processedGlobalSettings = processSettings(globalSettings)

  const globalSettingsComponents = processedGlobalSettings.map(
    (setting: ModeSetting) => (
      <ModeSettingRenderer
        key={setting.key}
        onChange={onSettingsUpdate(setQueryParam)}
        setting={setting}
      />
    )
  )

  const processedModeSettings = processSettings(modeSettingDefinitions)
  const processedModeButtons = modeButtonOptions.map(
    pipe(
      addModeButtonIcon(ModeIcon),
      addSettingsToButton(processedModeSettings),
      setModeButtonEnabled(enabledModeButtons)
    )
  )

  return (
    <PanelOverlay className="advanced-settings" ref={innerRef}>
      <HeaderContainer>
        <PageTitle title={headerText} />
        <h1 className="header-text">{headerText}</h1>
        <CloseButton
          aria-label={closeButtonText}
          onClick={closeAdvancedSettings}
          title={closeButtonText}
        >
          <Close size={22} />
        </CloseButton>
      </HeaderContainer>
      {/**
       * Date time selector goes here
       */}
      <Subheader>
        <FormattedMessage id="components.BatchSearchScreen.tripOptions" />
      </Subheader>

      <GlobalSettingsContainer>
        {globalSettingsComponents}
      </GlobalSettingsContainer>
      <Subheader>
        <FormattedMessage id="components.BatchSearchScreen.modeOptions" />
      </Subheader>
      <AdvancedModeSubsettingsContainer
        accentColor={accentColor}
        fillModeIcons
        label="test"
        modeButtons={processedModeButtons}
        onSettingsUpdate={onSettingsUpdate(setQueryParam)}
        onToggleModeButton={setModeButton(
          enabledModeButtons,
          onSettingsUpdate(setQueryParam)
        )}
      />
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
