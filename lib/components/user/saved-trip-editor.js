import React from 'react'

import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles the existing account display.
 */
const SavedTripEditor = ({ onCancel, onComplete, panes }) => {
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
    <StackedPaneDisplay
      onCancel={onCancel}
      onComplete={onComplete}
      paneSequence={paneSequence}
    />
  )
}

export default SavedTripEditor
