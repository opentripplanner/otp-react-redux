import React from 'react'

import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles editing of an existing trip.
 */
const SavedTripEditor = props => {
  // The props include Formik props that provide access to the current trip data (stored in props.values)
  // and to its own blur/change/submit event handlers that automate the state.
  // We forward the props to each pane so that their individual controls
  // can be wired to be managed by Formik.
  const {
    isCreating,
    onCancel,
    panes,
    values: monitoredTrip
  } = props
  if (monitoredTrip) {
    const paneSequence = [
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

    return (
      <div>
        <StackedPaneDisplay
          onCancel={onCancel}
          paneSequence={paneSequence}
          title={isCreating ? 'Save new trip' : 'Edit saved trip'}
        />
      </div>
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
