import {
  addSettingsToButton,
  MetroModeSelector,
  populateSettingWithValue
} from '@opentripplanner/trip-form'
import { connect } from 'react-redux'
import {
  decodeQueryParams,
  DelimitedArrayParam,
  encodeQueryParams
} from 'use-query-params'
import {
  ModeButtonDefinition,
  ModeSetting,
  ModeSettingValues
} from '@opentripplanner/types'
import { Search } from '@styled-icons/fa-solid/Search'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import { useIntl } from 'react-intl'
import React, { useCallback, useContext, useState } from 'react'
import tinycolor from 'tinycolor2'

import * as apiActions from '../../actions/api'
import { ComponentContext } from '../../util/contexts'
import { generateModeSettingValues } from '../../util/api'
import { getActiveSearch, hasValidLocation } from '../../util/state'
import { getFormattedMode } from '../../util/i18n'
import { StyledIconWrapper } from '../util/styledIcon'

import {
  MainSettingsRow,
  ModeSelectorContainer,
  PlanTripButton
} from './batch-styled'
import DateTimeButton from './date-time-button'

const queryParamConfig = { modeButtons: DelimitedArrayParam }

// TYPESCRIPT TODO: better types
type Props = {
  activeSearch: any
  config: any
  currentQuery: any
  enabledModeButtons: string[]
  fillModeIcons?: boolean
  modeButtonOptions: ModeButtonDefinition[]
  modeSettingDefinitions: ModeSetting[]
  modeSettingValues: ModeSettingValues
  onPlanTripClick: () => void
  routingQuery: any
  setUrlSearch: (evt: any) => void
  spacedOutModeSelector?: boolean
  urlSearchParams: URLSearchParams
}

// This method is used to daisy-chain a series of functions together on a given value
function pipe<T>(...fns: Array<(arg: T) => T>) {
  return (value: T) => fns.reduce((acc, fn) => fn(acc), value)
}

export function setModeButtonEnabled(enabledKeys: string[]) {
  return (modeButton: ModeButtonDefinition): ModeButtonDefinition => {
    return {
      ...modeButton,
      enabled: enabledKeys.includes(modeButton.key)
    }
  }
}

/**
 * Main panel for the batch/trip comparison form.
 */
function BatchSettings({
  activeSearch,
  currentQuery,
  enabledModeButtons,
  fillModeIcons,
  modeButtonOptions,
  modeSettingDefinitions,
  modeSettingValues,
  onPlanTripClick,
  routingQuery,
  setUrlSearch,
  spacedOutModeSelector
}: Props) {
  const intl = useIntl()

  // State that holds the id of the active element triggered via keyboard.
  // It is used to enable/disable hover effects to avoid keyboard focus being stolen
  // and overlapping popups on mouse hover.
  const [itemWithKeyboard, setItemWithKeyboard] = useState<string>(null)

  // @ts-expect-error Context not typed
  const { ModeIcon } = useContext(ComponentContext)

  const addModeButtonIcon = useCallback(
    (def: ModeButtonDefinition) => ({
      ...def,
      Icon: function ModeButtonIcon() {
        return <ModeIcon mode={def.iconName} />
      }
    }),
    [ModeIcon]
  )

  const populateSettingWithIcon = useCallback(
    (msd: ModeSetting) => ({
      ...msd,
      icon: <ModeIcon mode={msd.iconName} width={16} />
    }),
    [ModeIcon]
  )

  const addCustomSettingLabels = useCallback(
    (msd: ModeSetting) =>
      msd.type === 'SUBMODE'
        ? {
            ...msd,
            label: getFormattedMode(msd.addTransportMode.mode, intl)
          }
        : msd,
    [intl]
  )

  const processedModeSettings = modeSettingDefinitions.map(
    pipe(
      populateSettingWithIcon,
      populateSettingWithValue(modeSettingValues),
      addCustomSettingLabels
    )
  )

  const processedModeButtons = modeButtonOptions.map(
    pipe(
      addModeButtonIcon,
      addSettingsToButton(processedModeSettings),
      setModeButtonEnabled(enabledModeButtons)
    )
  )

  const _planTrip = useCallback(() => {
    // Check for any validation issues in query.
    const issues = []
    if (!hasValidLocation(currentQuery, 'from')) {
      issues.push(intl.formatMessage({ id: 'components.BatchSettings.origin' }))
    }
    if (!hasValidLocation(currentQuery, 'to')) {
      issues.push(
        intl.formatMessage({ id: 'components.BatchSettings.destination' })
      )
    }
    onPlanTripClick && onPlanTripClick()
    if (issues.length > 0) {
      // TODO: replace with less obtrusive validation.
      window.alert(
        intl.formatMessage(
          { id: 'components.BatchSettings.validationMessage' },
          { issues: intl.formatList(issues, { type: 'conjunction' }) }
        )
      )
      return
    }

    // Plan trip.
    routingQuery()
  }, [currentQuery, intl, onPlanTripClick, routingQuery])

  const _toggleModeButton = useCallback(
    (buttonId: string, newState: boolean) => {
      let newButtons
      if (newState) {
        newButtons = [...enabledModeButtons, buttonId]
      } else {
        newButtons = enabledModeButtons.filter((c) => c !== buttonId)
      }

      // encodeQueryParams serializes the mode buttons for the URL
      // to get nice looking URL params and consistency
      setUrlSearch(
        encodeQueryParams(queryParamConfig, { modeButtons: newButtons })
      )
    },
    [enabledModeButtons, setUrlSearch]
  )

  // We can rely on this existing, as there is a default
  const baseColor = getComputedStyle(document.documentElement).getPropertyValue(
    '--main-base-color'
  )
  const accentColor = tinycolor(baseColor).darken(10)

  return (
    <MainSettingsRow>
      <DateTimeButton
        id="date-time-button"
        itemWithKeyboard={itemWithKeyboard}
        onPopupClose={useCallback(() => {
          setItemWithKeyboard(null)
        }, [setItemWithKeyboard])}
        onPopupKeyboardExpand={setItemWithKeyboard}
      />
      <ModeSelectorContainer squashed={!spacedOutModeSelector}>
        <MetroModeSelector
          accentColor={baseColor}
          activeHoverColor={accentColor.toHexString()}
          fillModeIcons={fillModeIcons}
          label={intl.formatMessage({
            id: 'components.BatchSearchScreen.modeSelectorLabel'
          })}
          modeButtons={processedModeButtons}
          onSettingsUpdate={setUrlSearch}
          onToggleModeButton={_toggleModeButton}
        />
        <PlanTripButton
          id="plan-trip"
          onClick={_planTrip}
          title={intl.formatMessage({
            id: 'components.BatchSettings.planTripTooltip'
          })}
        >
          <StyledIconWrapper style={{ fontSize: '1.6em' }}>
            {hasValidLocation(currentQuery, 'from') &&
            hasValidLocation(currentQuery, 'to') &&
            !!activeSearch ? (
              <SyncAlt />
            ) : (
              <Search />
            )}
          </StyledIconWrapper>
        </PlanTripButton>
      </ModeSelectorContainer>
    </MainSettingsRow>
  )
}

// connect to the redux store
// TODO: Typescript
const mapStateToProps = (state: any) => {
  const urlSearchParams = new URLSearchParams(state.router.location.search)
  const modeSettingValues = generateModeSettingValues(
    urlSearchParams,
    state.otp?.modeSettingDefinitions || [],
    state.otp.config.modes?.initialState?.modeSettingValues
  )
  return {
    activeSearch: getActiveSearch(state),
    config: state.otp.config,
    currentQuery: state.otp.currentQuery,
    // TODO: Duplicated in apiv2.js
    enabledModeButtons:
      decodeQueryParams(queryParamConfig, {
        modeButtons: urlSearchParams.get('modeButtons')
      })?.modeButtons ||
      state.otp.config?.modes?.initialState?.enabledModeButtons ||
      {},
    fillModeIcons: state.otp.config.itinerary?.fillModeIcons,
    modeButtonOptions: state.otp.config?.modes?.modeButtons || [],
    modeSettingDefinitions: state.otp?.modeSettingDefinitions || [],
    modeSettingValues,
    spacedOutModeSelector: state.otp?.config?.modes?.spacedOut,
    urlSearchParams
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setUrlSearch: apiActions.setUrlSearch
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchSettings)
