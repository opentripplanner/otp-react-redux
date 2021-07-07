export const Modules = {
  CALL_TAKER: 'call',
  FIELD_TRIP: 'ft',
  MAILABLES: 'mailables'
}

export function isModuleEnabled (state, moduleName) {
  return Boolean(getModuleConfig(state, moduleName))
}

export function getModuleConfig (state, moduleName) {
  return state.otp.config?.modules?.find(m => m.id === moduleName)
}
