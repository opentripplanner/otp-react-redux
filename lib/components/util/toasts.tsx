import { IntlShape } from 'react-intl'
import React from 'react'
import toast from 'react-hot-toast'

import { getPlaceMainText } from '../../util/user'
import { UserSavedLocation } from '../user/types'

// Note: the HTML for toasts is rendered outside of the IntlProvider context,
// so intl.formatMessage and others have to be used instead of <FormattedMessage> tags.

/**
 * Helper that will display a toast notification when a place is saved.
 */
export function toastOnPlaceSaved(
  place: UserSavedLocation,
  intl: IntlShape
): void {
  toast.success(
    <span>
      <strong>{getPlaceMainText(place, intl)}</strong>
      <br />
      {intl.formatMessage({
        id: 'actions.user.placeRemembered'
      })}
    </span>
  )
}
