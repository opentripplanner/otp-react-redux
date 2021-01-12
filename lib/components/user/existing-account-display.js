import React from 'react'

import LinkButton from './link-button'
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
      pane: () => <p><LinkButton to='/savedtrips'>Edit my trips</LinkButton></p>,
      title: 'My trips'
    },
    {
      pane: panes.terms,
      props: { ...props, disableCheckTerms: true },
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
      title: 'My places'
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
