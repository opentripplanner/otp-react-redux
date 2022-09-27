import React, { Component, HTMLAttributes } from 'react'

interface State {
  counterString: number
  timer?: number
}

/**
 * Component that displays the call time (ticking with each second)
 * for an active call (assumes that mount time corresponds with call start).
 */
export default class CallTimeCounter extends Component<
  HTMLAttributes<HTMLDivElement>,
  State
> {
  state = {
    counterString: 0,
    timer: undefined
  }

  componentDidMount(): void {
    this._startRefresh()
  }

  componentWillUnmount(): void {
    this._stopRefresh()
  }

  /**
   * Formats seconds as hh:mm:ss string.
   */
  _formatSeconds = (seconds: number): string => {
    const date = new Date(0)
    date.setSeconds(seconds)
    return date.toISOString().substr(11, 8)
  }

  _refreshCounter = (): void => {
    const counterString = this.state.counterString + 1
    this.setState({ counterString })
  }

  _startRefresh = (): void => {
    // Set refresh to every second.
    const timer = window.setInterval(this._refreshCounter, 1000)
    this.setState({ timer })
  }

  _stopRefresh = (): void => {
    window.clearInterval(this.state.timer)
  }

  render(): JSX.Element {
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
