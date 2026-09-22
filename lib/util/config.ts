import { Route } from '@opentripplanner/types'

import { AppReduxState } from './state-types'
import { ModuleConfig } from './config-types'

export const Modules = {
  CALL_TAKER: 'call',
  FIELD_TRIP: 'ft',
  MAILABLES: 'mailables',
  MOBILITY_PROFILE: 'mobilityProfile'
}

export function getModuleConfig(
  state: AppReduxState,
  moduleName: string
): ModuleConfig | undefined {
  return state.otp.config?.modules?.find((m) => m.id === moduleName)
}

export function isModuleEnabled(
  state: AppReduxState,
  moduleName: string
): boolean {
  return Boolean(getModuleConfig(state, moduleName))
}

export function checkForRouteModeOverride(
  route: Route,
  overrideConfig: Record<string, string>
): string | undefined {
  return overrideConfig?.[route.id] || route.mode
}
