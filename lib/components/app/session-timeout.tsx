/* eslint-disable react/prop-types */
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
import { FormattedMessage } from 'react-intl'

/**
 * This component makes the current session timeout
 * by displaying a timeout warning one minute before the timeout,
 * and by reloading the initial URL if there is no user-initiated
 * actions within the timeout window.
 */
class SessionTimeout extends Component {
  state = {
    showTimeoutWarning: false,
    timeoutObject: null,
    timeoutStartMillis: 0
  }

  componentDidMount() {
    // Wait one second or so after loading before probing for changes
    // so that initialization actions can complete.
    setTimeout(this.handleAfterInitialActions, 1500)
  }

  componentWillUnmount() {
    clearInterval(this.state.timeoutObject)
  }

  handleAfterInitialActions = () => {
    this.setState({
      timeoutObject: setInterval(this.handleTimeoutWatch, 10000),
      timeoutStartMillis: new Date().valueOf()
    })
    console.log('timeout start millis: ' + new Date().valueOf())
  }

  handleTimeoutWatch = () => {
    const { lastActionMillis, sessionTimeoutSeconds, startOverFromInitialUrl } =
      this.props
    if (lastActionMillis > this.state.timeoutStartMillis) {
      const idleMillis = new Date().valueOf() - lastActionMillis
      const secondsToTimeout = sessionTimeoutSeconds - idleMillis / 1000
      console.log('Seconds to timeout: ' + secondsToTimeout)

      if (secondsToTimeout < 0) {
        // Reload initial URL (page state is lost after this point)
        startOverFromInitialUrl()
      } else {
        this.setState({
          // If within a minute of timeout, display dialog, don't otherwise.
          showTimeoutWarning: secondsToTimeout >= 0 && secondsToTimeout <= 60
        })
      }
    }
  }

  handleKeepSession = () => {
    this.setState({
      showTimeoutWarning: false
    })
    this.props.resetSessionTimeout()
  }

  render() {
    const { startOverFromInitialUrl } = this.props
    const { showTimeoutWarning } = this.state
    return showTimeoutWarning ? (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>
            <FormattedMessage id="components.SessionTimeout.header" />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormattedMessage id="components.SessionTimeout.body" />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={startOverFromInitialUrl}>
            <FormattedMessage id="common.forms.startOver" />
          </Button>
          <Button bsStyle="primary" onClick={this.handleKeepSession}>
            <FormattedMessage id="components.SessionTimeout.keepSession" />
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    ) : null
  }
}

const mapStateToProps = (state) => {
  const { config, lastActionMillis } = state.otp
  const { sessionTimeoutSeconds } = config
  return {
    lastActionMillis,
    sessionTimeoutSeconds
  }
}

const mapDispatchToProps = {
  resetSessionTimeout: uiActions.resetSessionTimeout,
  startOverFromInitialUrl: uiActions.startOverFromInitialUrl
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionTimeout)
