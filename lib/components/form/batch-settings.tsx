/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
// FIXME: type OTP-UI
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { hasValidLocation } from '../../util/state'
import Icon from '../util/icon'

import {
  BatchPreferencesContainer,
  DateTimeModalContainer,
  MainSettingsRow,
  PlanTripButton,
  SettingsPreview,
  StyledDateTimePreview
} from './batch-styled'
import { Dot } from './styled'
import BatchPreferences, { replaceTransitMode } from './batch-preferences'
import DateTimeModal from './date-time-modal'
import ModeButtons, { getModeOptions, StyledModeButton } from './mode-buttons'
import type { Combination } from './batch-preferences'

/**
 * Simple utility to check whether a list of mode strings contains the provided
 * mode. This handles exact match and prefix/suffix matches (i.e., checking
 * 'BICYCLE' will return true if 'BICYCLE' or 'BICYCLE_RENT' is in the list).
 *
 * FIXME: This might need to be modified to be a bit looser in how it handles
 * the 'contains' check. E.g., we might not want to remove WALK,TRANSIT if walk
 * is turned off, but we DO want to remove it if TRANSIT is turned off.
 */
function listHasMode(modes: string[], mode: string) {
  return modes.some((m: string) => mode.indexOf(m) !== -1)
}

function combinationHasAnyOfModes(combination: Combination, modes: string[]) {
  return combination.mode.split(',').some((m: string) => listHasMode(modes, m))
}

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

/**
 * Main panel for the batch/trip comparison form.
 */
// TYPESCRIPT TODO: better types
class BatchSettings extends Component<{
  config: any
  currentQuery: any
  intl: IntlShape
  modeOptions: Mode[]
  possibleCombinations: Combination[]
  routingQuery: any
  setQueryParam: (queryParam: any) => void
}> {
  state = {
    expanded: null,
    selectedModes: getModeOptions(this.props.intl).map((m) => m.mode)
  }

  _onClickMode = (mode: string) => {
    const { currentQuery, modeOptions, possibleCombinations, setQueryParam } =
      this.props
    const { selectedModes } = this.state
    const index = selectedModes.indexOf(mode)
    const enableMode = index === -1
    const newModes = [...selectedModes]
    if (enableMode) newModes.push(mode)
    else newModes.splice(index, 1)
    // Update selected modes for mode buttons.
    this.setState({ selectedModes: newModes })
    // Update the available mode combinations based on the new modes selection.
    const possibleModes = modeOptions.map((m) => m.mode)
    const disabledModes = possibleModes.filter(
      // WALK will be filtered out separately, later
      // Since we don't want to remove walk+other combos when walk is deselected.
      (m) => !newModes.includes(m) && m !== 'WALK'
    )
    // Do not include combination if any of its modes are found in disabled
    // modes list.
    const newCombinations = possibleCombinations
      // Filter out WALK only mode if walk is disabled
      .filter((c) => newModes.includes('WALK') || c.mode !== 'WALK')
      .filter((c) => !combinationHasAnyOfModes(c, disabledModes))
      .map(replaceTransitMode(currentQuery.mode))
    setQueryParam({ combinations: newCombinations, disabledModes })
  }

  _planTrip = () => {
    const { currentQuery, intl, routingQuery } = this.props
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
    this.setState({ expanded: null })

    // Plan trip.
    routingQuery()
  }

  _updateExpanded = (type: string) => ({
    expanded: this.state.expanded === type ? null : type
  })

  _toggleDateTime = () => this.setState(this._updateExpanded('DATE_TIME'))

  _toggleSettings = () => this.setState(this._updateExpanded('SETTINGS'))

  render() {
    const { config, currentQuery, intl, modeOptions } = this.props
    const { expanded, selectedModes } = this.state
    return (
      <>
        <ModeButtonsFullWidthContainer className="hidden-lg">
          <ModeButtonsFullWidth
            className="flex"
            modeOptions={modeOptions}
            onClick={this._onClickMode}
            selectedModes={selectedModes}
          />
        </ModeButtonsFullWidthContainer>
        <MainSettingsRow>
          <SettingsPreview
            expanded={expanded === 'SETTINGS'}
            onClick={this._toggleSettings}
          >
            {coreUtils.query.isNotDefaultQuery(currentQuery, config) && (
              <Dot className="dot" />
            )}
            <Icon className="fa-2x" type="cog" />
          </SettingsPreview>
          <StyledDateTimePreview
            // as='button'
            expanded={expanded === 'DATE_TIME'}
            hideButton
            onClick={this._toggleDateTime}
          />
          <ModeButtonsContainerCompressed>
            <ModeButtonsCompressed
              className="visible-lg straight-corners"
              modeOptions={modeOptions}
              onClick={this._onClickMode}
              selectedModes={selectedModes}
            />
          </ModeButtonsContainerCompressed>
          <PlanTripButton
            onClick={this._planTrip}
            title={intl.formatMessage({
              id: 'components.BatchSettings.planTripTooltip'
            })}
          >
            <Icon className="fa-2x" type="search" />
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
}

// connect to the redux store
// TODO: Typescript
const mapStateToProps = (state: any) => ({
  config: state.otp.config,
  currentQuery: state.otp.currentQuery,
  modeOptions: state.otp.config.modes.modeOptions,
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
