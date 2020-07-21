import React from 'react'

import LinkButton from './link-button'
import SequentialPaneDisplay from './sequential-pane-display'

/**
 * This component shows a step-by-step progression of screens to build a MonitoredTrip.
 */
const SavedTripWizard = ({ monitoredTrip, onComplete, panes }) => {
  const paneSequence = {
    basics: {
      disableNext: !monitoredTrip.tripName,
      nextId: 'notifications',
      pane: panes.basics,
      title: 'Trip information'
    },
    notifications: {
      nextId: 'summary',
      pane: panes.notifications,
      prevId: 'basics',
      title: 'Trip notification preferences'
    },
    summary: {
      pane: panes.summary,
      prevId: 'notifications',
      title: 'Trip summary'
    }
  }

  return (
    <div>
      {/* TODO: Improve navigation. */}
      <p><LinkButton to='/'>Back to Trip Planner</LinkButton></p>
      <SequentialPaneDisplay
        initialPaneId='basics'
        onComplete={onComplete}
        paneSequence={paneSequence}
      />
    </div>
  )
}

export default SavedTripWizard
