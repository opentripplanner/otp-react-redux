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

export const toastPromise = async <T extends unknown>(
  promise: Promise<T>,
  successMessage: JSX.Element | string,
  intl: IntlShape,
  id?: string,
  silentOnSuccess = false
): Promise<T> => {
  const toastStatusMessages = {
    error: intl.formatMessage({
      id: 'components.UserAccountScreen.errorUpdatingProfile'
    }),
    loading: intl.formatMessage({
      id: 'common.forms.loading'
    }),
    success: successMessage
  }
  const toastSettings: DefaultToastOptions = {
    ariaProps: {
      'aria-live': 'assertive',
      role: 'alert'
    }
  }
  if (silentOnSuccess) {
    toastSettings.className = 'toast-hidden'
  }
  if (id) {
    toastSettings.id = id
  }
  const result = await toast.promise(
    promise,
    toastStatusMessages,
    toastSettings
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
