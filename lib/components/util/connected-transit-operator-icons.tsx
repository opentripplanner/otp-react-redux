import { connect } from 'react-redux'
import { TransitOperator } from '@opentripplanner/types'
import React, { Component } from 'react'

import { AppReduxState } from '../../util/state-types'

import { StopData } from './types'
import TransitOperatorLogos from './transit-operator-icons'

interface Props {
  stopData?: StopData
  transitOperators: TransitOperator[]
}

class ConnectedTransitOperatorLogos extends Component<Props> {
  // clean this up
  render() {
    return (
      <TransitOperatorLogos
        stopData={this.props.stopData}
        transitOperators={this.props.transitOperators}
      />
    )
  }
}

const mapDispatchToProps = {}

const mapStateToProps = (
  state: AppReduxState,
  ownProps: Props & { stopId: string }
) => {
  const stops = state.otp.transitIndex.stops
  // clean this up
  return {
    stopData: stops?.[ownProps.stopId],
    transitOperators: state.otp.config.transitOperators || []
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedTransitOperatorLogos)
