import React from 'react'
import { FormattedMessage } from 'react-intl'

import BackToTripPlanner from './back-to-trip-planner'
import DeleteUser from './delete-user'
import NotificationPrefsPane from './notification-prefs-pane'
import FavoritePlaceList from './places/favorite-place-list'
import StackedPaneDisplay from './stacked-pane-display'
import TermsOfUsePane from './terms-of-use-pane'

/**
 * This component handles the existing account display.
 */
const ExistingAccountDisplay = props => {
  // The props include Formik props that provide access to the current user data
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const { onCancel } = props
  const paneSequence = [
    {
      pane: FavoritePlaceList,
      props,
      title: <FormattedMessage id='components.ExistingAccountDisplay.places' />
    },
    {
      pane: NotificationPrefsPane,
      props,
      title: <FormattedMessage id='components.ExistingAccountDisplay.notifications' />
    },
    {
      pane: TermsOfUsePane,
      props: { ...props, disableCheckTerms: true },
      title: <FormattedMessage id='components.ExistingAccountDisplay.terms' />
    },
    {
      pane: DeleteUser,
      props
    }
  ]
  return (
    <div>
      <BackToTripPlanner />
      <StackedPaneDisplay
        onCancel={onCancel}
        paneSequence={paneSequence}
        title={<FormattedMessage id='components.ExistingAccountDisplay.mainTitle' />}
      />
    </div>
  )
}

export default ExistingAccountDisplay
