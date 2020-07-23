// import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'

/**
 * Connected component that displays the call time (ticking with each second)
 * for an active call.
 */
class CallTimeCounter extends Component {
  state = {
    counterString: 0
  }

  componentDidUpdate (prevProps) {
    // console.log('counter props update', this.props, prevProps)
    const callHasBegun = !prevProps.activeCall && this.props.activeCall
    const callHasEnded = !this.props.activeCall && prevProps.activeCall
    if (callHasEnded) this._resetCounter()
    if (callHasBegun) this._startRefresh()
  }

  /**
   * Formats seconds as hh:mm:ss string.
   */
  _formatSeconds = (seconds) => {
    const date = new Date(0)
    date.setSeconds(seconds)
    return date.toISOString().substr(11, 8)
  }

  _resetCounter = () => {
    this._stopRefresh()
    this.setState({counterString: 0})
  }

  _refreshCounter = () => {
    const counterString = this.state.counterString + 1
    console.log(this.props.name, counterString)
    this.setState({counterString})
  }

  _startRefresh = () => {
    // Set refresh to every second.
    const timer = window.setInterval(this._refreshCounter, 1000)
    // console.log(this.props.name, 'starting')
    this.setState({ timer })
  }

  _stopRefresh = () => {
    window.clearInterval(this.state.timer)
  }

  render () {
    const {activeCall, className, style} = this.props
    if (!activeCall) return null
    return (
      <div className={className} style={style}>
        {this._formatSeconds(this.state.counterString)}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    activeCall: state.callTaker.activeCall
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(CallTimeCounter)
