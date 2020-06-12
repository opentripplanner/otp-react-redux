export function getCallForId (id, state) {
  return state.callTaker.callHistory.calls.data.find(call => call.id === id)
}
