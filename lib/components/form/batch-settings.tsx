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

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { ComponentContext } from '../../util/contexts'
import { generateModeSettingValues } from '../../util/api'
import { getActiveSearch, hasValidLocation } from '../../util/state'
import { getBaseColor, getDarkenedBaseColor } from '../util/colors'
import { getFormattedMode } from '../../util/i18n'
import { RoutingQueryCallResult } from '../../actions/api-constants'
import { StyledIconWrapper } from '../util/styledIcon'

import {
  addCustomSettingLabels,
  addModeButtonIcon,
  pipe,
  populateSettingWithIcon
} from './util'
import {
  MainSettingsRow,
  ModeSelectorContainer,
  PlanTripButton
} from './batch-styled'
import AdvancedSettingsButton from './advanced-settings-button'
import DateTimeButton from './date-time-button'

const queryParamConfig = { modeButtons: DelimitedArrayParam }

// TYPESCRIPT TODO: better types
type Props = {
  activeSearch: any
  currentQuery: any
  enabledModeButtons: string[]
  fillModeIcons?: boolean
  modeButtonOptions: ModeButtonDefinition[]
  modeSettingDefinitions: ModeSetting[]
  modeSettingValues: ModeSettingValues
  onPlanTripClick: () => void
  openAdvancedSettings?: () => void
  routingQuery: any
  setQueryParam: (evt: any) => void
  spacedOutModeSelector?: boolean
  updateQueryTimeIfLeavingNow: () => void
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
  openAdvancedSettings,
  routingQuery,
  setQueryParam,
  spacedOutModeSelector,
  updateQueryTimeIfLeavingNow
}: Props) {
  const intl = useIntl()

  // Whether the date/time selector is open
  const [dateTimeOpen, setDateTimeOpen] = useState(false)

  // Whether the mode selector has a popup open
  const [modeSelectorPopup, setModeSelectorPopup] = useState(false)

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
    updateQueryTimeIfLeavingNow()
    const routingQueryResult = routingQuery()

    // If mode combination is not valid (i.e. produced no query), alert the user.
    if (routingQueryResult === RoutingQueryCallResult.INVALID_MODE_SELECTION) {
      window.alert(
        intl.formatMessage({
          id: 'components.BatchSettings.invalidModeSelection'
        })
      )
    }
  }, [
    currentQuery,
    intl,
    onPlanTripClick,
    routingQuery,
    updateQueryTimeIfLeavingNow
  ])

  /**
   * Stores parameters in both the Redux `currentQuery` and URL
   * @param params Params to store
   */
  const _onSettingsUpdate = useCallback(
    (params: any) => {
      setQueryParam({ queryParamData: params, ...params })
    },
    [setQueryParam]
  )

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
      _onSettingsUpdate(
        encodeQueryParams(queryParamConfig, { modeButtons: newButtons })
      )
    },
    [enabledModeButtons, _onSettingsUpdate]
  )

  /**
   * Check whether the mode selector is showing a popup.
   */
  const checkModeSelectorPopup = useCallback(() => {
    const modeSelectorPopup = document.querySelector(
      '.metro-mode-selector div[role="dialog"]'
    )
    setModeSelectorPopup(!!modeSelectorPopup)
  }, [setModeSelectorPopup])

  const baseColor = getBaseColor()

  const accentColor = getDarkenedBaseColor()

  return (
    <MainSettingsRow onMouseMove={checkModeSelectorPopup}>
      <DateTimeButton
        open={dateTimeOpen}
        setOpen={setDateTimeOpen}
        // Prevent the hover on date/time selector when mode selector has a popup open via keyboard.
        style={{ pointerEvents: modeSelectorPopup ? 'none' : undefined }}
      />
      {openAdvancedSettings && (
        <AdvancedSettingsButton onClick={openAdvancedSettings} />
      )}
      <ModeSelectorContainer
        squashed={!spacedOutModeSelector}
        // Prevent hover effect on mode selector when date selector is activated via keyboard.
        style={{ pointerEvents: dateTimeOpen ? 'none' : undefined }}
      >
        <MetroModeSelector
          accentColor={baseColor}
          activeHoverColor={accentColor.toHexString()}
          fillModeIcons={fillModeIcons}
          label={intl.formatMessage({
            id: 'components.BatchSearchScreen.modeSelectorLabel'
          })}
          modeButtons={processedModeButtons}
          onSettingsUpdate={_onSettingsUpdate}
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
    spacedOutModeSelector: state.otp?.config?.modes?.spacedOut
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam,
  updateQueryTimeIfLeavingNow: formActions.updateQueryTimeIfLeavingNow
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchSettings)
