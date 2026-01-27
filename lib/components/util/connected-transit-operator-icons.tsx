import { connect } from 'react-redux'
import { TransitOperator } from '@opentripplanner/types'
import React from 'react'

import { AppReduxState } from '../../util/state-types'
import { FETCH_STATUS } from '../../util/constants'

import { StopData } from './types'
import TransitOperatorLogos from './transit-operator-icons'

interface Props {
  stopData?: StopData
  transitOperators: TransitOperator[]
}

function TransitOperatorIcons({ stopData, transitOperators }: Props) {
  const loading = stopData?.fetchStatus === FETCH_STATUS.FETCHING
  return (
    <TransitOperatorLogos
      loading={loading}
      stopData={stopData}
      transitOperators={transitOperators}
    />
  )
}

const mapStateToProps = (
  state: AppReduxState,
  ownProps: Props & { stopId: string }
) => {
  const stops = state.otp.transitIndex.stops
  return {
    stopData: stops?.[ownProps.stopId],
    transitOperators: state.otp.config.transitOperators || []
  }
}

export default connect(mapStateToProps)(TransitOperatorIcons)
