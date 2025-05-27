import { IntlShape } from 'react-intl'
import React from 'react'
import toast, { DefaultToastOptions } from 'react-hot-toast'

import { getPlaceMainText } from '../../util/user'
import { UserSavedLocation } from '../user/types'

// Note: the HTML for toasts is rendered outside of the IntlProvider context,
// so intl.formatMessage and others have to be used instead of <FormattedMessage> tags.

export const formattedToastSuccessMessage = (
  title: string,
  description: string
): JSX.Element => {
  return (
    <span style={{ fontWeight: 400 }}>
      <strong>{title}</strong>
      <br />
      {description}
    </span>
  )
}

export const toastStatusMessages = (
  successMessage: JSX.Element | string,
  intl: IntlShape
): any => {
  return {
    error: intl.formatMessage({
      id: 'components.UserAccountScreen.errorUpdatingProfile'
    }),
    loading: intl.formatMessage({
      id: 'common.forms.loading'
    }),
    success: successMessage
  }
}

export const toastSettings = (
  id?: string | undefined,
  silentOnSuccess?: boolean
): DefaultToastOptions => {
  const settings: DefaultToastOptions = {
    ariaProps: {
      'aria-live': 'assertive',
      role: 'status'
    }
  }
  if (silentOnSuccess) {
    settings.className = 'toast-hidden'
  }
  if (id) {
    settings.id = id
  }
  return settings
}

export const toastPromise = async (
  promise: Promise<any>,
  successMessage: JSX.Element | string,
  intl: IntlShape,
  id?: string,
  silentOnSuccess = false
): Promise<any> => {
  const result = await toast.promise(
    promise,
    toastStatusMessages(successMessage, intl),
    toastSettings(id, silentOnSuccess)
  )
  return result
}

export const toastMessageOnPlaceChanged = (
  place: UserSavedLocation,
  intl: IntlShape,
  change: 'Remembered' | 'Deleted'
): JSX.Element => {
  return formattedToastSuccessMessage(
    getPlaceMainText(place, intl),
    change === 'Remembered'
      ? intl.formatMessage({
          id: 'actions.user.placeRemembered'
        })
      : intl.formatMessage({
          id: 'actions.user.placeDeleted'
        })
  )
}
