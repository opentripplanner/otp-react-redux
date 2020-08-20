// import moment from 'moment'
import React, { Component } from 'react'

/**
 * Component that displays the call time (ticking with each second)
 * for an active call (assumes that mount time corresponds with call start).
 */
export default class CallTimeCounter extends Component {
  state = {
    counterString: 0
  }

  componentDidMount () {
    this._startRefresh()
  }

  componentWillUnmount () {
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
    this.setState({counterString})
  }

  _startRefresh = () => {
    // Set refresh to every second.
    const timer = window.setInterval(this._refreshCounter, 1000)
    this.setState({ timer })
  }

  _stopRefresh = () => {
    window.clearInterval(this.state.timer)
  }

  render () {
    const {className, style} = this.props
    return (
      <div className={className} style={style}>
        {this._formatSeconds(this.state.counterString)}
      </div>
    )
  }
}
