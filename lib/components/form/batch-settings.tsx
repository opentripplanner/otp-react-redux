import { connect } from 'react-redux'
import { decodeQueryParams } from 'use-query-params'
import {
  DepartArriveDropdown,
  MetroModeSelector
} from '@opentripplanner/trip-form'
import { ModeButtonDefinition } from '@opentripplanner/types'
import { Search } from '@styled-icons/fa-solid/Search'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import { useIntl } from 'react-intl'
import React, { useCallback, useContext, useEffect } from 'react'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import * as narrativeActions from '../../actions/narrative'
import { ComponentContext } from '../../util/contexts'
import { getActiveSearch, hasValidLocation } from '../../util/state'
import { getBaseColor, getDarkenedBaseColor } from '../util/colors'
import { StyledIconWrapper } from '../util/styledIcon'
import AnimateHeight from 'react-animate-height'

import {
  addModeButtonIcon,
  alertUserTripPlan,
  modesQueryParamConfig,
  onSettingsUpdate,
  pipe,
  setModeButton
} from './util'
import {
  AdvancedOptionsContainer,
  MainSettingsRow,
  ModeSelectorContainer,
  PlanTripButton
} from './batch-styled'
import AdvancedSettingsButton from './advanced-settings-button'
import DateTimeModal, {
  DepartArriveValue,
  setQueryParamMiddleware
} from './date-time-modal'

// TYPESCRIPT TODO: better types
type Props = {
  activeSearch: any
  currentQuery: any
  departArrive: DepartArriveValue
  enabledModeButtons: string[]
  fillModeIcons?: boolean
  homeTimezone: string
  modeButtonOptions: ModeButtonDefinition[]
  onPlanTripClick: () => void
  openAdvancedSettings: () => void
  routingQuery: any
  setQueryParam: (evt: any) => void
  sort: any
  syncSortWithDepartArrive: any
  updateItineraryFilter: any
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
  departArrive,
  enabledModeButtons,
  fillModeIcons,
  homeTimezone,
  modeButtonOptions,
  onPlanTripClick,
  openAdvancedSettings,
  routingQuery,
  setQueryParam,
  sort,
  syncSortWithDepartArrive,
  updateItineraryFilter
}: Props) {
  const intl = useIntl()

  // @ts-expect-error Context not typed
  const { ModeIcon } = useContext(ComponentContext)

  const processedModeButtons = modeButtonOptions.map(
    pipe(addModeButtonIcon(ModeIcon), setModeButtonEnabled(enabledModeButtons))
  )

  const baseColor = getBaseColor()

  const accentColor = getDarkenedBaseColor()

  const onQueryParamChange = useCallback(
    (params) => {
      setQueryParamMiddleware(
        syncSortWithDepartArrive,
        updateItineraryFilter,
        params,
        setQueryParam,
        sort
      )
    },
    [syncSortWithDepartArrive, updateItineraryFilter, setQueryParam, sort]
  )

  const dtSelectorOpen = departArrive !== 'NOW'

  // If the user selects depart or arrive, set the focus to the time input
  useEffect(() => {
    const dtTimeInput = document.querySelector(
      ".date-time-selector input[type='time']"
    )
    if (dtSelectorOpen) {
      // eslint-disable-next-line prettier/prettier
      (dtTimeInput as HTMLElement)?.focus()
    }
  }, [dtSelectorOpen, departArrive])

  return (
    <MainSettingsRow className="main-settings-row">
      <AdvancedOptionsContainer>
        <DepartArriveDropdown
          departArrive={departArrive}
          onQueryParamChange={onQueryParamChange}
          timeZone={homeTimezone}
        />
        <AdvancedSettingsButton onClick={openAdvancedSettings} />
      </AdvancedOptionsContainer>
      <AnimateHeight
        duration={200}
        height={dtSelectorOpen ? 'auto' : 0}
        style={{
          marginBottom: dtSelectorOpen ? '10px' : 0,
          transition: 'ease all 200ms'
        }}
      >
        <DateTimeModal />
      </AnimateHeight>

      <ModeSelectorContainer>
        <MetroModeSelector
          accentColor={baseColor}
          activeHoverColor={accentColor.toHexString()}
          fillModeIcons={fillModeIcons}
          label={intl.formatMessage({
            id: 'components.BatchSearchScreen.modeSelectorLabel'
          })}
          modeButtons={processedModeButtons}
          onSettingsUpdate={onSettingsUpdate(setQueryParam)}
          onToggleModeButton={setModeButton(
            enabledModeButtons,
            onSettingsUpdate(setQueryParam)
          )}
        />
        <PlanTripButton
          id="plan-trip"
          onClick={onPlanTripClick}
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
  const { homeTimezone, modes } = state.otp.config
  const { departArrive } = state.otp.currentQuery
  return {
    activeSearch: getActiveSearch(state),
    currentQuery: state.otp.currentQuery,
    departArrive,
    // TODO: Duplicated in apiv2.js
    enabledModeButtons:
      decodeQueryParams(modesQueryParamConfig, {
        modeButtons: urlSearchParams.get('modeButtons')
      })?.modeButtons ||
      modes?.initialState?.enabledModeButtons ||
      {},
    fillModeIcons: state.otp.config.itinerary?.fillModeIcons,
    homeTimezone,
    modeButtonOptions: modes?.modeButtons || [],
    sort: state.otp.filter.sort,
    syncSortWithDepartArrive:
      state.otp.config?.itinerary?.syncSortWithDepartArrive
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam,
  updateItineraryFilter: narrativeActions.updateItineraryFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchSettings)
