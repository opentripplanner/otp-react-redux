import { connect } from 'react-redux'
import { decodeQueryParams } from 'use-query-params'
import { MetroModeSelector } from '@opentripplanner/trip-form'
import { ModeButtonDefinition } from '@opentripplanner/types'
import { Search } from '@styled-icons/fa-solid/Search'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import { useIntl } from 'react-intl'
import React, { useCallback, useContext, useState } from 'react'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { ComponentContext } from '../../util/contexts'
import { getActiveSearch, hasValidLocation } from '../../util/state'
import { getBaseColor, getDarkenedBaseColor } from '../util/colors'
import { StyledIconWrapper } from '../util/styledIcon'

import {
  addModeButtonIcon,
  alertUserTripPlan,
  modesQueryParamConfig,
  onSettingsUpdate,
  pipe,
  setModeButton
} from './util'
import {
  MainSettingsRow,
  ModeSelectorContainer,
  PlanTripButton,
  TripFormButtonContainer
} from './batch-styled'
import AdvancedSettingsButton from './advanced-settings-button'
import DateTimeModal from './date-time-modal'

// TYPESCRIPT TODO: better types
type Props = {
  activeSearch: any
  currentQuery: any
  enabledModeButtons: string[]
  fillModeIcons?: boolean
  modeButtonOptions: ModeButtonDefinition[]
  onPlanTripClick: () => void
  openAdvancedSettings: () => void
  routingQuery: any
  setQueryParam: (evt: any) => void
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
  onPlanTripClick,
  openAdvancedSettings,
  routingQuery,
  setQueryParam
}: Props) {
  const intl = useIntl()

  // @ts-expect-error Context not typed
  const { ModeIcon } = useContext(ComponentContext)

  const processedModeButtons = modeButtonOptions.map(
    pipe(addModeButtonIcon(ModeIcon), setModeButtonEnabled(enabledModeButtons))
  )

  const _planTrip = useCallback(() => {
    alertUserTripPlan(intl, currentQuery, onPlanTripClick, routingQuery)
  }, [currentQuery, intl, onPlanTripClick, routingQuery])

  const baseColor = getBaseColor()

  const accentColor = getDarkenedBaseColor()

  return (
    <MainSettingsRow className="main-settings-row">
      <DateTimeModal />
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
        <TripFormButtonContainer className="trip-form-buttons">
          <AdvancedSettingsButton onClick={openAdvancedSettings} />
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
        </TripFormButtonContainer>
      </ModeSelectorContainer>
    </MainSettingsRow>
  )
}

// connect to the redux store
// TODO: Typescript
const mapStateToProps = (state: any) => {
  const urlSearchParams = new URLSearchParams(state.router.location.search)
  const { modes } = state.otp.config
  return {
    activeSearch: getActiveSearch(state),
    currentQuery: state.otp.currentQuery,
    // TODO: Duplicated in apiv2.js
    enabledModeButtons:
      decodeQueryParams(modesQueryParamConfig, {
        modeButtons: urlSearchParams.get('modeButtons')
      })?.modeButtons ||
      modes?.initialState?.enabledModeButtons ||
      {},
    fillModeIcons: state.otp.config.itinerary?.fillModeIcons,
    modeButtonOptions: modes?.modeButtons || []
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchSettings)
