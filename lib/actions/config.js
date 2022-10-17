import { createAction } from 'redux-actions'

export const setAutoPlan = createAction('SET_AUTOPLAN')

// TODO: this should eventually be handled via mapState
export const setRouterId = createAction('SET_ROUTER_ID')
export const updateOverlayVisibility = createAction('UPDATE_OVERLAY_VISIBILITY')
