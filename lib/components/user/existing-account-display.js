import React from 'react'

import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles the existing account display.
 */
const ExistingAccountDisplay = ({ onCancel, onComplete, panes }) => {
  const paneSequence = [
    {
      pane: panes.terms,
      props: { disableCheckTerms: true },
      title: 'Terms'
    },
    {
      pane: panes.notifications,
      title: 'Notifications'
    },
    {
      pane: panes.locations,
      title: 'My locations'
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

export default ExistingAccountDisplay
