import React from 'react'

import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles editing of an existing trip.
 */
const SavedTripEditor = ({
  isCreating,
  monitoredTrip,
  onCancel,
  onComplete,
  panes
}) => {
  if (monitoredTrip) {
    const paneSequence = [
      {
        pane: panes.basics,
        title: 'Trip information'
      },
      {
        pane: panes.notifications,
        title: 'Trip notifications'
      }
    ]

    return (
      <>
        <h1>{isCreating ? 'Save trip' : monitoredTrip.tripName}</h1>
        <StackedPaneDisplay
          onCancel={onCancel}
          onComplete={onComplete}
          paneSequence={paneSequence}
        />
      </>
    )
  }

  return (
    <>
      <h1>Trip Not Found</h1>
      <p>Sorry, the requested trip was not found.</p>
    </>
  )
}

export default SavedTripEditor
