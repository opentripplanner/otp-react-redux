import { createAction } from 'redux-actions'

export const settingCurrentUser = createAction('SET_CURRENT_USER')

export function setCurrentUser (user) {
  return function (dispatch, getState) {
    dispatch(settingCurrentUser(user))
  }
}
