import { DelimitedArrayParam, encodeQueryParams } from 'serialize-query-params'
import { IntlShape } from 'react-intl'
import { ModeButtonDefinition, ModeSetting } from '@opentripplanner/types'
import React from 'react'

import { getFormattedMode } from '../../util/i18n'
import { hasValidLocation } from '../../util/state'
import { QueryParamChangeHandler } from '../util/types'
import { RoutingQueryCallResult } from '../../actions/api-constants'
import { updateQueryTimeIfLeavingNow } from '../../actions/form'

// This method is used to daisy-chain a series of functions together on a given value
export function pipe<T>(...fns: Array<(arg: T) => T>) {
  return (value: T) => fns.reduce((acc, fn) => fn(acc), value)
}

export const modesQueryParamConfig = { modeButtons: DelimitedArrayParam }

export const populateSettingWithIcon =
  (ModeIcon: React.ComponentType<{ mode?: string; width?: number }>) =>
  // eslint-disable-next-line react/display-name
  (modeSetting: ModeSetting): ModeSetting => ({
    ...modeSetting,
    icon: <ModeIcon mode={modeSetting.iconName} width={16} />
  })

export const addModeButtonIcon =
  (ModeIcon: React.ComponentType<{ mode?: string; width?: number }>) =>
  (def: ModeButtonDefinition): ModeButtonDefinition => ({
    ...def,
    Icon: function ModeButtonIcon() {
      return <ModeIcon mode={def.iconName} />
    }
  })

export const addCustomSettingLabels =
  (intl: IntlShape) =>
  (modeSetting: ModeSetting): ModeSetting => {
    let modeLabel
    // If we're using route mode overrides, make sure we're using the custom mode name
    if (modeSetting.type === 'SUBMODE') {
      modeLabel = modeSetting.overrideMode || modeSetting.addTransportMode.mode
      return {
        ...modeSetting,
        label: getFormattedMode(modeLabel, intl)
      }
    }
    return modeSetting
  }

/**
 * Stores parameters in both the Redux `currentQuery` and URL
 * @param params Params to store
 */
export const onSettingsUpdate =
  (setQueryParam: QueryParamChangeHandler) =>
  (params: any): void => {
    setQueryParam({ queryParamData: params, ...params })
  }

export const setModeButton =
  (enabledModeButtons: string[], updateHandler: (params: any) => void) =>
  (buttonId: string, newState: boolean): void => {
    let newButtons
    if (newState) {
      newButtons = [...enabledModeButtons, buttonId]
    } else {
      newButtons = enabledModeButtons.filter((c) => c !== buttonId)
    }

    // encodeQueryParams serializes the mode buttons for the URL
    // to get nice looking URL params and consistency
    updateHandler(
      encodeQueryParams(modesQueryParamConfig, { modeButtons: newButtons })
    )
  }

export const alertUserTripPlan = (
  intl: IntlShape,
  currentQuery: any,
  onPlanTripClick: () => void,
  routingQuery: () => any
): void => {
  // Check for any validation issues in query.
  const issues: string[] = []
  if (!hasValidLocation(currentQuery, 'from')) {
    issues.push(intl.formatMessage({ id: 'components.BatchSettings.origin' }))
  }
  if (!hasValidLocation(currentQuery, 'to')) {
    issues.push(
      intl.formatMessage({ id: 'components.BatchSettings.destination' })
    )
  }
  onPlanTripClick()
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
}
