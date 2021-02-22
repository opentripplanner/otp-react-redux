import React from 'react'

import BackToTripPlanner from './back-to-trip-planner'
import NotificationPrefsPane from './notification-prefs-pane'
import FavoritePlacesList from './places/favorite-places-list'
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
      pane: FavoritePlacesList,
      props,
      title: 'My locations'
    },
    {
      pane: NotificationPrefsPane,
      props,
      title: 'Notifications'
    },
    {
      pane: TermsOfUsePane,
      props: { ...props, disableCheckTerms: true },
      title: 'Terms'
    }
  ]
  return (
    <div>
      <BackToTripPlanner />
      <StackedPaneDisplay
        onCancel={onCancel}
        paneSequence={paneSequence}
        title='My settings'
      />
    </div>
  )
}

export default ExistingAccountDisplay
