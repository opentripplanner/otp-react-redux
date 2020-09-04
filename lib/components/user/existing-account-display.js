import React, { Component } from 'react'

import LinkButton from './link-button'
import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles the existing account display.
 */
class ExistingAccountDisplay extends Component {
  render () {
    const { onCancel, onComplete, onRevertUserPhoneNumber, onSendPhoneVerification, onStartPhoneVerification, panes } = this.props
    const paneSequence = [
      {
        pane: () => <p><LinkButton to='/savedtrips'>Edit my trips</LinkButton></p>,
        title: 'My trips'
      },
      {
        pane: panes.terms,
        props: { disableCheckTerms: true },
        title: 'Terms'
      },
      {
        pane: panes.notifications,
        props: { onRevertUserPhoneNumber, onSendPhoneVerification, onStartPhoneVerification },
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
        title='My Account'
      />
    )
  }
}

export default ExistingAccountDisplay
