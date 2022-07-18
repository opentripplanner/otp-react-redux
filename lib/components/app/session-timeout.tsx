/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/prop-types */
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'

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
    // @ts-ignore SessionTimeout is not typed yet
    clearInterval(this.state.timeoutObject)
  }

  handleAfterInitialActions = () => {
    this.setState({
      timeoutObject: setInterval(this.handleTimeoutWatch, 10000),
      timeoutStartMillis: new Date().valueOf()
    })
  }

  handleTimeoutWatch = () => {
    // @ts-ignore SessionTimeout is not typed yet
    const { lastActionMillis, sessionTimeoutSeconds, startOverFromInitialUrl } =
      this.props
    if (lastActionMillis > this.state.timeoutStartMillis) {
      const idleMillis = new Date().valueOf() - lastActionMillis
      const secondsToTimeout = sessionTimeoutSeconds - idleMillis / 1000

      if (secondsToTimeout < 0) {
        // TODO: If OTP middleware persistence is enabled,
        // log out the logged-in user before resetting the page.

        // Reload initial URL (page state is lost after this point)
        startOverFromInitialUrl()
      } else {
        // If session is going to expire, display warning dialog, don't otherwise.
        // For session timeouts of more than 180 seconds, display warning within one minute.
        // For timeouts shorter than that, set the warning to 1/3 of the session timeout.
        const timeoutWarningSeconds =
          sessionTimeoutSeconds >= 180 ? 60 : sessionTimeoutSeconds / 3

        this.setState({
          showTimeoutWarning:
            secondsToTimeout >= 0 && secondsToTimeout <= timeoutWarningSeconds
        })
      }
    }
  }

  handleKeepSession = () => {
    // @ts-ignore SessionTimeout is not typed yet
    this.setState({
      showTimeoutWarning: false
    })
    // @ts-ignore SessionTimeout is not typed yet
    this.props.resetSessionTimeout()
  }

  render() {
    // @ts-ignore SessionTimeout is not typed yet
    const { startOverFromInitialUrl } = this.props
    // @ts-ignore SessionTimeout is not typed yet
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

// @ts-ignore SessionTimeout is not typed yet
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
