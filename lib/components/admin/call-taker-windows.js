import React, { Component } from 'react'

import CallHistoryWindow from './call-history-window'
import MailablesWindow from './mailables-window'

/**
 * Collects the various draggable windows used in the Call Taker module to
 * display, for example, the call record list and (TODO) the list of field trips.
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
