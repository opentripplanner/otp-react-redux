import React from 'react'

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
    <SequentialPaneDisplay
      initialPaneId='basics'
      onComplete={onComplete}
      paneSequence={paneSequence}
    />
  )
}

export default SavedTripWizard
