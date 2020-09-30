import React from 'react'

import LinkButton from './link-button'
import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles the existing account display.
 */
const ExistingAccountDisplay = props => {
  const { onCancel, panes } = props
  const paneSequence = [
    {
      pane: () => <p><LinkButton to='/savedtrips'>Edit my trips</LinkButton></p>,
      title: 'My trips'
    },
    {
      pane: panes.terms,
      props: { disableCheckTerms: true, ...props },
      title: 'Terms'
    },
    {
      pane: panes.notifications,
      props,
      title: 'Notifications'
    },
    {
      pane: panes.locations,
      props,
      title: 'My locations'
    }
  ]

  return (
    <StackedPaneDisplay
      onCancel={onCancel}
      paneSequence={paneSequence}
      title='My Account'
    />
  )
}

export default ExistingAccountDisplay
