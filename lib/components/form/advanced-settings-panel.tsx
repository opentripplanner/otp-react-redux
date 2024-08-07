import {
  addSettingsToButton,
  AdvancedModeSubsettingsContainer,
  ModeSettingRenderer,
  populateSettingWithValue
} from '@opentripplanner/trip-form'
import { Check } from '@styled-icons/boxicons-regular'
import { Close } from '@styled-icons/fa-solid'
import { connect } from 'react-redux'
import { decodeQueryParams, DelimitedArrayParam } from 'serialize-query-params'
import { FormattedMessage, useIntl } from 'react-intl'
import { invisibleCss } from '@opentripplanner/trip-form/lib/MetroModeSelector'
import {
  ModeButtonDefinition,
  ModeSetting,
  ModeSettingValues
} from '@opentripplanner/types'
import React, { RefObject, useContext, useState } from 'react'
import styled from 'styled-components'

import * as formActions from '../../actions/form'
import { AppReduxState } from '../../util/state-types'
import { blue, getBaseColor } from '../util/colors'
import { ComponentContext } from '../../util/contexts'
import { generateModeSettingValues } from '../../util/api'
import PageTitle from '../util/page-title'

import {
  addCustomSettingLabels,
  addModeButtonIcon,
  onSettingsUpdate,
  pipe,
  populateSettingWithIcon,
  setModeButton
} from './util'
import { setModeButtonEnabled } from './batch-settings'
import { styledCheckboxCss } from './styled'
import DateTimeModal from './date-time-modal'

const PanelOverlay = styled.div`
  height: 100%;
  left: 0;
  padding: 1.5em;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
  overflow-y: auto;
`

const GlobalSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-bottom: 2em;

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
  height: 30px;
`

const Subheader = styled.h2`
  ${invisibleCss}
`

const ReturnToTripPlanButton = styled.button`
  align-items: center;
  background-color: var(--main-base-color, ${blue[900]});
  border: 0;
  color: white;
  display: flex;
  font-weight: 700;
  gap: 5px;
  height: 51px;
  justify-content: center;
  margin-top: 2em;
  width: 100%;

  svg {
    margin-bottom: 7px;
  }
`

const DtSelectorContainer = styled.div`
  margin: 2em 0;

  .date-time-modal {
    padding: 0;

    .main-panel {
      margin: 0;

      button {
        padding: 6px 0;
      }

      .date-time-selector {
        margin: 15px 0;
      }
    }
  }
`

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
  onPlanTripClick: () => void
  setQueryParam: (evt: any) => void
}): JSX.Element => {
  const [closingBySave, setClosingBySave] = useState(false)
  const [closingByX, setClosingByX] = useState(false)
  const baseColor = getBaseColor()
  const accentColor = baseColor || blue[900]

  const intl = useIntl()
  const closeButtonText = intl.formatMessage({
    id: 'components.BatchSearchScreen.saveAndReturn'
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
          onClick={() => {
            setClosingByX(true)
            closeAdvancedSettings()
          }}
          title={closeButtonText}
        >
          {closingByX ? <Check size={30} /> : <Close size={22} />}
        </CloseButton>
      </HeaderContainer>
      <DtSelectorContainer>
        <DateTimeModal />
      </DtSelectorContainer>
      {processedGlobalSettings.length > 0 && (
        <>
          <Subheader>
            <FormattedMessage id="components.BatchSearchScreen.tripOptions" />
          </Subheader>
          <GlobalSettingsContainer className="global-settings-container">
            {globalSettingsComponents}
          </GlobalSettingsContainer>
        </>
      )}
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
      <ReturnToTripPlanButton
        onClick={() => {
          setClosingBySave(true)
          closeAdvancedSettings()
        }}
      >
        {closingBySave ? (
          <>
            <FormattedMessage id="components.BatchSearchScreen.saved" />
            <Check size={22} />
          </>
        ) : (
          <FormattedMessage id="components.BatchSearchScreen.saveAndReturn" />
        )}
      </ReturnToTripPlanButton>
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
  setQueryParam: formActions.setQueryParam,
  updateQueryTimeIfLeavingNow: formActions.updateQueryTimeIfLeavingNow
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdvancedSettingsPanel)
