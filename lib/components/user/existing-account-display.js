import React from 'react'

import BackToTripPlanner from './back-to-trip-planner'
import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles the existing account display.
 */
const ExistingAccountDisplay = props => {
  // The props include Formik props that provide access to the current user data
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const { onCancel, panes } = props
  const paneSequence = [
    {
      pane: panes.locations,
      props,
      title: 'My locations'
    },
    {
      pane: panes.notifications,
      props,
      title: 'Notifications'
    },
    {
      pane: panes.terms,
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
