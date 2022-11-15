/* eslint-disable react/prop-types */
import { Cog } from '@styled-icons/fa-solid/Cog'
import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
import { Search } from '@styled-icons/fa-solid/Search'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { combinationFilter } from '../../util/combination-filter'
import { getActiveSearch, hasValidLocation } from '../../util/state'
import { getDefaultModes } from '../../util/itinerary'
import { StyledIconWrapper } from '../util/styledIcon'

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
import ModeButtons, {
  defaultModeOptions,
  StyledModeButton
} from './mode-buttons'
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
  activeSearch: any
  config: any
  currentQuery: any
  intl: IntlShape
  modeOptions: Mode[]
  possibleCombinations: Combination[]
  routingQuery: any
  setQueryParam: (queryParam: any) => void
}

type State = {
  expanded?: string | null
  selectedModes: string[]
}

/**
 * Main panel for the batch/trip comparison form.
 */
class BatchSettings extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      expanded: null,
      selectedModes: getDefaultModes(props.modeOptions) || []
    }
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
    const disabledModes = possibleModes.filter((m) => !newModes.includes(m))
    // Only include a combination if it every required mode is enabled.
    const newCombinations = possibleCombinations
      .filter(combinationFilter(newModes))
      .map(replaceTransitMode(currentQuery.mode))

    setQueryParam({
      combinations: newCombinations,
      disabledModes,
      enabledModes: newModes
    })
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
    const { activeSearch, config, currentQuery, intl, modeOptions } = this.props
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
            aria-label={intl.formatMessage({
              id: 'components.BatchSettings.settings'
            })}
            expanded={expanded === 'SETTINGS'}
            onClick={this._toggleSettings}
          >
            {coreUtils.query.isNotDefaultQuery(currentQuery, config) && (
              <Dot className="dot" />
            )}
            <StyledIconWrapper size="2x">
              <Cog />
            </StyledIconWrapper>
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
            id="plan-trip"
            onClick={this._planTrip}
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
