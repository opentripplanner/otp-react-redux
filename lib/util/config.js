export const Modules = {
  CALL_TAKER: 'call',
  FIELD_TRIP: 'ft',
  MAILABLES: 'mailables'
}

export function getModuleConfig(state, moduleName) {
  return state.otp.config?.modules?.find((m) => m.id === moduleName)
}

export function isModuleEnabled(state, moduleName) {
  return Boolean(getModuleConfig(state, moduleName))
}

export function checkForRouteModeOverride(route, overrideConfig) {
  return overrideConfig?.[route.id] || route.mode
}
