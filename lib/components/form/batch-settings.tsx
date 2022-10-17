/* eslint-disable react/prop-types */
import { Cog } from '@styled-icons/fa-solid/Cog'
import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
import { MetroModeSelector, useModeState } from '@opentripplanner/trip-form'
import { Search } from '@styled-icons/fa-solid/Search'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import coreUtils from '@opentripplanner/core-utils'
import React, { useState } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { Bicycle, Bus, Walking } from '@styled-icons/fa-solid'
import { hasValidLocation } from '../../util/state'
import { StyledIconWrapper } from '../util/styledIcon'

import {
  BatchPreferencesContainer,
  DateTimeModalContainer,
  MainSettingsRow,
  StyledDateTimePreview,
  StyledPlanTripButton
} from './batch-styled'
import { Dot } from './styled'
import BatchPreferences from './batch-preferences'
import DateTimeModal from './date-time-modal'
import ModeButtons, {
  defaultModeOptions,
  StyledModeButton
} from './mode-buttons'
import modeSettings from './modeSettings.yml'
import type { Combination } from './batch-preferences'
import type { Mode } from './mode-buttons'

const ModeButtonsFullWidthContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`

// Define Mode Button styled components here to avoid circular imports. I.e., we
// cannot define them in styled.js (because mode-buttons.js imports buttonCss
// and then we would need to import ModeButtons/StyledModeButton from that file
// in turn).
const ModeButtonsFullWidth = styled(ModeButtons)`
  &:last-child {
    margin-right: 0px;
  }
`

const ModeButtonsContainerCompressed = styled.div`
  display: contents;
`

const ModeButtonsCompressed = styled(ModeButtons)`
  ${StyledModeButton} {
    border-radius: 0px;
  }
  &:first-child {
    border-radius: 5px 0px 0px 5px;
  }
  &:last-child {
    margin-right: 5px;
    border-radius: 0px 5px 5px 0px;
  }
`
// TYPESCRIPT TODO: better types
type Props = {
  config: any
  currentQuery: any
  intl: IntlShape
  modeOptions: Mode[]
  possibleCombinations: Combination[]
  routingQuery: any
  setQueryParam: (queryParam: any) => void
}

/**
 * Main panel for the batch/trip comparison form.
 */
function BatchSettings({
  config,
  currentQuery,
  intl,
  modeOptions,
  routingQuery
}: Props) {
  const [expanded, setExpanded] = useState<null | string>(null)

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
    setExpanded(null)

    // Plan trip.
    routingQuery()
  }

  const _updateExpanded = (type: string) => (expanded === type ? null : type)

  const _toggleDateTime = () => setExpanded(_updateExpanded('DATE_TIME'))

  const combinations = [
    {
      Icon: Bus,
      key: 'TRANSIT',
      label: 'Transit',
      modes: [
        {
          mode: 'TRANSIT'
        }
      ]
    },
    {
      Icon: Walking,
      key: 'WALK',
      label: 'Walking',
      modes: [{ mode: 'WALK' }]
    },
    {
      Icon: Bicycle,
      key: 'BIKE',
      label: 'Bike',
      modes: [{ mode: 'BICYCLE' }, { mode: 'BIKESHARE' }]
    }
  ]

  const initialState = {
    enabledCombinations: ['TRANSIT'],
    modeSettingValues: {}
  }

  const {
    combinations: combinationsFromState,
    setModeSettingValue,
    toggleCombination
  } = useModeState(combinations, initialState, modeSettings, {
    queryParamState: true
  })

  return (
    <>
      <ModeButtonsFullWidthContainer className="hidden-lg">
        {/* <ModeButtonsFullWidth
          className="flex"
          modeOptions={modeOptions}
          onClick={_onClickMode}
          selectedModes={selectedModes}
        /> */}
      </ModeButtonsFullWidthContainer>
      <MainSettingsRow>
        <StyledDateTimePreview
          // as='button'
          expanded={expanded === 'DATE_TIME'}
          hideButton
          onClick={_toggleDateTime}
        />
        <ModeButtonsContainerCompressed>
          {/* <ModeButtonsCompressed
            className="visible-lg straight-corners"
            modeOptions={modeOptions}
            onClick={_onClickMode}
            selectedModes={selectedModes}
          /> */}
          <MetroModeSelector
            combinations={combinationsFromState}
            onSettingsUpdate={setModeSettingValue}
            onToggleCombination={toggleCombination}
          />
        </ModeButtonsContainerCompressed>
        <StyledPlanTripButton
          onClick={_planTrip}
          title={intl.formatMessage({
            id: 'components.BatchSettings.planTripTooltip'
          })}
        >
          <StyledIconWrapper style={{ fontSize: '1.6em' }}>
            {hasValidLocation(currentQuery, 'from') ||
            hasValidLocation(currentQuery, 'to') ? (
              <SyncAlt />
            ) : (
              <Search />
            )}
          </StyledIconWrapper>
        </StyledPlanTripButton>
      </MainSettingsRow>
      {expanded === 'DATE_TIME' && (
        <DateTimeModalContainer>
          <DateTimeModal />
        </DateTimeModalContainer>
      )}
      {expanded === 'SETTINGS' && (
        <BatchPreferencesContainer>
          <BatchPreferences />
        </BatchPreferencesContainer>
      )}
    </>
  )
}

// connect to the redux store
// TODO: Typescript
const mapStateToProps = (state: any) => ({
  config: state.otp.config,
  currentQuery: state.otp.currentQuery,
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
