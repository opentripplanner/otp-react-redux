import React from 'react'
import { Button } from 'react-bootstrap'

import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles editing of an existing trip.
 */
const SavedTripEditor = props => {
  const {
    isCreating,
    onCancel,
    onDeleteTrip,
    panes,
    values: monitoredTrip
  } = props
  if (monitoredTrip) {
    let paneSequence
    if (isCreating) {
      paneSequence = [
        {
          pane: panes.basics,
          props,
          title: 'Trip information'
        },
        {
          pane: panes.notifications,
          props,
          title: 'Trip notifications'
        }
      ]
    } else {
      paneSequence = [
        {
          pane: panes.basics,
          props,
          title: 'Trip overview'
        },
        {
          pane: panes.notifications,
          props,
          title: 'Trip notifications'
        },
        {
          // TODO: Find a better place for this.
          pane: () => <Button bsStyle='danger' onClick={onDeleteTrip}>Delete Trip</Button>,
          title: 'Danger zone'
        }
      ]
    }

    return (
      <>
        <h1>{isCreating ? 'Save trip' : monitoredTrip.tripName}</h1>
        <StackedPaneDisplay
          onCancel={onCancel}
          //onComplete={onComplete}
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
