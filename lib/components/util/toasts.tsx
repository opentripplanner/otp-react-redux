import { IntlShape } from 'react-intl'
import React from 'react'
import toast from 'react-hot-toast'

import { getPlaceMainText } from '../../util/user'
import { UserSavedLocation } from '../user/types'

// Note: the HTML for toasts is rendered outside of the IntlProvider context,
// so intl.formatMessage and others have to be used instead of <FormattedMessage> tags.

/**
 * Helper for displaying formatted toasts.
 */
export function toastSuccess(
  title: string,
  description: string,
  id?: string
): void {
  toast.success(
    <span>
      <strong>{title}</strong>
      <br />
      {description}
    </span>,
    {
      id
    }
  )
}

/**
 * Helper that will display a toast notification when a place is saved.
 */
export function toastOnPlaceSaved(
  place: UserSavedLocation,
  intl: IntlShape
): void {
  toastSuccess(
    getPlaceMainText(place, intl),
    intl.formatMessage({
      id: 'actions.user.placeRemembered'
    })
  )
}
