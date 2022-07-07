import React, { Component } from 'react'

interface State {
  counterString: number
}

/**
 * Component that displays the call time (ticking with each second)
 * for an active call (assumes that mount time corresponds with call start).
 */
export default class CallTimeCounter extends Component<HTMLDivElement, State> {
  state = {
    counterString: 0
  }

  componentDidMount() {
    this._startRefresh()
  }

  componentWillUnmount() {
    this._stopRefresh()
  }

  /**
   * Formats seconds as hh:mm:ss string.
   */
  _formatSeconds = (seconds) => {
    const date = new Date(0)
    date.setSeconds(seconds)
    return date.toISOString().substr(11, 8)
  }

  _refreshCounter = () => {
    const counterString = this.state.counterString + 1
    this.setState({ counterString })
  }

  _startRefresh = () => {
    // Set refresh to every second.
    const timer = window.setInterval(this._refreshCounter, 1000)
    this.setState({ timer })
  }

  _stopRefresh = () => {
    window.clearInterval(this.state.timer)
  }

  render() {
    const { className } = this.props
    return (
      <div
        // Pass the className for styling with
        // styled-components
        className={className}
        style={{ display: 'inline' }}
      >
        {this._formatSeconds(this.state.counterString)}
      </div>
    )
  }
}
