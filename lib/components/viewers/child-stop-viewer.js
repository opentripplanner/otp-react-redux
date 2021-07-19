import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as apiActions from '../../actions/api'

class ChildStopViewer extends Component {
  componentDidMount () {
    this.props.fetchStopInfo(this.props.viewedStop)
  }

  _findChildStops = async (stop) => {
    const findChildStop = await this.props.findStop({ stopId: stop })
    console.log('findChildStop', findChildStop)
    return findChildStop
  }

  render () {
    const {childStops} = this.props
    const parentStop = childStops && childStops[0]
    const testStop = childStops && parentStop.childStops[0]
    testStop && this._findChildStops(testStop)

    const showChildStops = parentStop?.childStops.map(s =>
      <li key={s}>{s}</li>
    )

    // console.log('this._findChildStops(testStop)', this._findChildStops(testStop))
    console.log('parentStop', parentStop)
    console.log('testStop', testStop)
    console.log('childStops', childStops)
    return (
      <>
        <h3>Related Stops</h3>
        <ul>{showChildStops}</ul>
      </>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const stopLookup = state.otp.transitIndex.stops
  const stopData = stopLookup[state.otp.ui.viewedStop.stopId]
  const childStops = stopData?.childStops?.map(stopId => stopLookup[stopId])
  return {
    childStops,
    stopData,
    viewedStop: state.otp.ui.viewedStop
  }
}

const mapDispatchToProps = {
  findStop: apiActions.findStop,
  fetchStopInfo: apiActions.fetchStopInfo

}

export default connect(mapStateToProps, mapDispatchToProps)(ChildStopViewer)
