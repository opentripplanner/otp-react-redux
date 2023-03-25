/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import {
  defaultModeSettings,
  MetroModeSelector,
  useModeState
} from '@opentripplanner/trip-form'
import { injectIntl, IntlShape } from 'react-intl'
import { Search } from '@styled-icons/fa-solid/Search'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import React, { useContext, useState } from 'react'
import type { ModeButtonDefinition } from '@opentripplanner/types'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { ComponentContext } from '../../util/contexts'
import { getActiveSearch, hasValidLocation } from '../../util/state'
import { StyledIconWrapper } from '../util/styledIcon'

import {
  DateTimeModalContainer,
  MainSettingsRow,
  PlanTripButton,
  StyledDateTimePreview,
  StyledDateTimePreviewContainer
} from './batch-styled'
import { defaultModeOptions } from './mode-buttons'
import DateTimeModal from './date-time-modal'

// TYPESCRIPT TODO: better types
type Props = {
  activeSearch: any
  config: any
  currentQuery: any
  intl: IntlShape
  modeButtonOptions: ModeButtonDefinition[]
  routingQuery: any
  setQueryParam: (queryParam: any) => void
}

/**
 * Main panel for the batch/trip comparison form.
 */
function BatchSettings({
  activeSearch,
  config,
  currentQuery,
  intl,
  modeButtonOptions,
  routingQuery
}: Props) {
  const [dateTimeExpanded, setDateTimeExpanded] = useState<boolean>(false)
  // @ts-expect-error Context not typed
  const { ModeIcon } = useContext(ComponentContext)

  const modeButtonsWithIcons: ModeButtonDefinition[] = modeButtonOptions.map(
    (button: ModeButtonDefinition) => ({
      ...button,
      Icon: React.memo(function ModeButtonIcon() {
        return <ModeIcon mode={button.iconName} />
      })
    })
  )

  const { buttonsWithSettings, setModeSettingValue, toggleModeButton } =
    useModeState(
      modeButtonsWithIcons,
      config.modes.initialState,
      [...defaultModeSettings, ...(config.modes.modeSettingDefinitions || [])],
      {
        queryParamState: true
      }
    )

  const _planTrip = () => {
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
    // Close any expanded panels.
    setDateTimeExpanded(false)

    // Plan trip.
    routingQuery()
  }

  return (
    <div role="group">
      <MainSettingsRow>
        <StyledDateTimePreviewContainer
          aria-controls="date-time-modal"
          aria-expanded={dateTimeExpanded}
          aria-label="Date/Time settings"
          expanded={dateTimeExpanded}
          onClick={() => setDateTimeExpanded(!dateTimeExpanded)}
        >
          <StyledDateTimePreview hideButton />
        </StyledDateTimePreviewContainer>
        <MetroModeSelector
          modeButtons={buttonsWithSettings}
          onSettingsUpdate={setModeSettingValue}
          onToggleModeButton={toggleModeButton}
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
      </MainSettingsRow>
      {dateTimeExpanded && (
        <DateTimeModalContainer id="date-time-modal">
          <DateTimeModal />
        </DateTimeModalContainer>
      )}
    </div>
  )
}

// connect to the redux store
// TODO: Typescript
const mapStateToProps = (state: any) => ({
  activeSearch: getActiveSearch(state),
  config: state.otp.config,
  currentQuery: state.otp.currentQuery,
  modeButtonOptions: state.otp.config.modes.modeButtons,
  modeOptions: state.otp.config.modes.modeOptions || defaultModeOptions,
  possibleCombinations: state.otp.config.modes.combinations
})

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BatchSettings))
