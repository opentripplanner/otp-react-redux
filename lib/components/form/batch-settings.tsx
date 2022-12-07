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
import styled from 'styled-components'
import type { ModeButtonDefinition } from '@opentripplanner/types'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { ComponentContext } from '../../util/contexts'
import { getActiveSearch, hasValidLocation } from '../../util/state'
import { StyledIconWrapper } from '../util/styledIcon'

import {
  BatchPreferencesContainer,
  DateTimeModalContainer,
  MainSettingsRow,
  PlanTripButton,
  StyledDateTimePreview
} from './batch-styled'
import { Dot } from './styled'
import BatchPreferences from './batch-preferences'
import DateTimeModal from './date-time-modal'
import ModeButtons, {
  defaultModeOptions,
  StyledModeButton
} from './mode-buttons'

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
  routingQuery
}: Props) {
  const [expanded, setExpanded] = useState<null | string>(null)
  const { ModeIcon } = useContext(ComponentContext)

  const modeButtonsWithIcons: ModeButtonDefinition[] =
    config.modes.modeButtons.map((button: ModeButtonDefinition) => ({
      ...button,
      Icon: React.memo(function ModeButtonIcon() {
        return <ModeIcon mode={button.iconName} />
      })
    }))

  const { buttonsWithSettings, setModeSettingValue, toggleModeButton } =
    useModeState(
      modeButtonsWithIcons,
      config.modes.initialState,
      defaultModeSettings,
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
    setExpanded(null)

    // Plan trip.
    routingQuery()
  }

  const _updateExpanded = (type: string) => (expanded === type ? null : type)

  const _toggleDateTime = () => setExpanded(_updateExpanded('DATE_TIME'))

  return (
    <>
      {/* <ModeButtonsFullWidthContainer className="hidden-lg">
      </ModeButtonsFullWidthContainer> */}
      <MainSettingsRow>
        <StyledDateTimePreview
          // as='button'
          expanded={expanded === 'DATE_TIME'}
          hideButton
          onClick={_toggleDateTime}
        />
        <ModeButtonsContainerCompressed>
          <MetroModeSelector
            modeButtons={buttonsWithSettings}
            onSettingsUpdate={setModeSettingValue}
            onToggleModeButton={toggleModeButton}
          />
        </ModeButtonsContainerCompressed>
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
  activeSearch: getActiveSearch(state),
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
