/* eslint-disable react/prop-types */
import {
  addSettingsToButton,
  convertModeSettingValue,
  MetroModeSelector,
  populateSettingWithValue
} from '@opentripplanner/trip-form'
import { connect } from 'react-redux'
import { injectIntl, IntlShape } from 'react-intl'
import { Search } from '@styled-icons/fa-solid/Search'
import { SyncAlt } from '@styled-icons/fa-solid/SyncAlt'
import React, { useContext, useState } from 'react'
import type {
  ModeButtonDefinition,
  ModeSetting,
  ModeSettingValues
} from '@opentripplanner/types'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import { ComponentContext } from '../../util/contexts'
import {
  decodeQueryParams,
  DelimitedArrayParam,
  encodeQueryParams
} from 'use-query-params'
import { getActiveSearch, hasValidLocation } from '../../util/state'
import { StyledIconWrapper } from '../util/styledIcon'

import {
  DateTimeModalContainer,
  MainSettingsRow,
  PlanTripButton,
  StyledDateTimePreview,
  StyledDateTimePreviewContainer
} from './batch-styled'
import DateTimeModal from './date-time-modal'

const queryParamConfig = { modeButtons: DelimitedArrayParam }

// TYPESCRIPT TODO: better types
type Props = {
  activeSearch: any
  config: any
  currentQuery: any
  enabledModeButtons: string[]
  fillModeIcons?: boolean
  intl: IntlShape
  modeButtonOptions: ModeButtonDefinition[]
  modeSettingDefinitions: ModeSetting[]
  modeSettingValues: ModeSettingValues
  routingQuery: any
  setQueryParam: (queryParam: any) => void
  setUrlSearch: (evt: any) => void
  urlSearchParams: URLSearchParams
}

function pipe<T>(...fns: Array<(arg: T) => T>) {
  return (value: T) => fns.reduce((acc, fn) => fn(acc), value)
}

// TODO: Move to otp-ui
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
  intl,
  modeButtonOptions,
  modeSettingDefinitions,
  modeSettingValues,
  routingQuery,
  setUrlSearch
}: Props) {
  const [dateTimeExpanded, setDateTimeExpanded] = useState<boolean>(false)
  // @ts-expect-error Context not typed
  const { ModeIcon } = useContext(ComponentContext)

  const addModeButtonIcon = React.useCallback(
    (def: ModeButtonDefinition) => ({
      ...def,
      Icon: function ModeButtonIcon() {
        return <ModeIcon mode={def.iconName} />
      }
    }),
    [ModeIcon]
  )

  const populateSettingWithIcon = React.useCallback(
    (msd: ModeSetting) => ({
      ...msd,
      icon: <ModeIcon mode={msd.iconName} width={16} />
    }),
    [ModeIcon]
  )

  const processedModeSettings = modeSettingDefinitions.map(
    pipe(populateSettingWithIcon, populateSettingWithValue(modeSettingValues))
  )

  const processedModeButtons = modeButtonOptions.map(
    pipe(
      addModeButtonIcon,
      addSettingsToButton(processedModeSettings),
      setModeButtonEnabled(enabledModeButtons)
    )
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

  const _toggleModeButton = (buttonId: string, newState: boolean) => {
    let newButtons
    if (newState) {
      newButtons = [...enabledModeButtons, buttonId]
    } else {
      newButtons = enabledModeButtons.filter((c) => c !== buttonId)
    }

    // encodeQueryParams serializes the mode buttons for the URL
    // It uses encodeQueryParams to get nice looking URL params and consistency
    setUrlSearch(
      encodeQueryParams(queryParamConfig, { modeButtons: newButtons })
    )
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
          fillModeIcons={fillModeIcons}
          modeButtons={processedModeButtons}
          onSettingsUpdate={(evt) => setUrlSearch(evt)}
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
const mapStateToProps = (state: any) => {
  const urlSearchParams = new URLSearchParams(state.router.location.search)
  const modeSettingValues = state.otp.modeSettingDefinitions.reduce(
    (acc: ModeSettingValues, setting: ModeSetting) => {
      const fromUrl = urlSearchParams.get(setting.key)
      acc[setting.key] = fromUrl
        ? convertModeSettingValue(setting, fromUrl)
        : state.otp?.config?.modes?.initialState?.modeSettingValues?.[
            setting.key
          ] || setting.default
      return acc
    },
    {}
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
    urlSearchParams
  }
}

const mapDispatchToProps = {
  routingQuery: apiActions.routingQuery,
  setQueryParam: formActions.setQueryParam,
  setUrlSearch: apiActions.setUrlSearch
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BatchSettings))
