import React, { Component } from 'react'

import CallHistoryWindow from './call-history-window'
import MailablesWindow from './mailables-window'

/**
 * Collects and renders the call history and mailables windows used in the Call
 * Taker module.
 */
export default class CallTakerWindows extends Component {
  render () {
    return (
      <>
        <CallHistoryWindow />
        <MailablesWindow />
      </>
    )
  }
}
