import React, { Component } from 'react'

import LinkButton from './link-button'
import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles the existing account display.
 */
class ExistingAccountDisplay extends Component {
  render () {
    const props = this.props
    const { handleSubmit, onCancel, panes } = props
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
        onComplete={handleSubmit}
        paneSequence={paneSequence}
        title='My Account'
      />
    )
  }
}

export default ExistingAccountDisplay
