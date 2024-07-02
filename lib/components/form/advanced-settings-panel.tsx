import {
  addSettingsToButton,
  AdvancedModeSubsettingsContainer,
  populateSettingWithValue
} from '@opentripplanner/trip-form'
import { Close } from '@styled-icons/fa-solid'
import { connect } from 'react-redux'
import { decodeQueryParams, DelimitedArrayParam } from 'serialize-query-params'
import { FormattedMessage, useIntl } from 'react-intl'
import { Search } from '@styled-icons/fa-solid/Search'

import { generateModeSettingValues } from '../../util/api'
import {
  ModeButtonDefinition,
  ModeSetting,
  ModeSettingValues
} from '@opentripplanner/types'

import PageTitle from '../util/page-title'

import React, { RefObject, useContext } from 'react'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'

import {
  addCustomSettingLabels,
  addModeButtonIcon,
  alertUserTripPlan,
  onSettingsUpdate,
  pipe,
  populateSettingWithIcon,
  setModeButton
} from './util'
import { AppReduxState } from '../../util/state-types'
import { setModeButtonEnabled } from './batch-settings'

import { blue, getBaseColor } from '../util/colors'
import { ComponentContext } from '../../util/contexts'

import styled from 'styled-components'

const baseColor = getBaseColor()
const accentColor = baseColor || blue[900]

const PanelOverlay = styled.div`
  height: 100%;
  left: 0;
  padding: 1.5em;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
  overflow-y: scroll;
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
  display: block;
  font-size: 18px;
  font-weight: 700;
  margin: 1em 0;
`

const PlanTripButton = styled.button`
  align-items: center;
  display: flex;
  justify-content: center;
  gap: 0.5em;
  background-color: ${baseColor};
  border: 0;
  width: 45%;
  height: 51px;
  color: white;
  font-weight: 700;
`

const ReturnToTripPlanButton = styled(PlanTripButton)`
  border: 2px solid ${baseColor};
  background-color: white;
  color: ${baseColor};
`
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2em;
`

const AdvancedSettingsPanel = ({
  closeAdvancedSettings,
  currentQuery,
  enabledModeButtons,
  innerRef,
  modeButtonOptions,
  modeSettingDefinitions,
  modeSettingValues,
  onPlanTripClick,
  routingQuery,
  setQueryParam
}: {
  closeAdvancedSettings: () => void
  currentQuery: any
  enabledModeButtons: string[]
  innerRef: RefObject<HTMLDivElement>
  modeButtonOptions: ModeButtonDefinition[]
  modeSettingDefinitions: ModeSetting[]
  modeSettingValues: ModeSettingValues
  onPlanTripClick: () => void
  routingQuery: () => void
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

  const planTrip = () => {
    alertUserTripPlan(intl, currentQuery, onPlanTripClick, routingQuery)
    closeAdvancedSettings()
  }

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
      {/**
       * Trip options (walk speed, walk reluctance, accessible routing) go here
       */}
      <Subheader>
        <FormattedMessage id="components.BatchSearchScreen.modeOptions" />
      </Subheader>
      {/**
       * AdvancedModeSubsettingsContainer (import from Otp-ui) goes here
       */}
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
      <ButtonContainer>
        <ReturnToTripPlanButton onClick={closeAdvancedSettings}>
          Back to Trip Plan
        </ReturnToTripPlanButton>
        <PlanTripButton onClick={planTrip}>
          <Search size={18} />
          <FormattedMessage id="components.BatchSettings.planTripTooltip" />
        </PlanTripButton>
      </ButtonContainer>
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
