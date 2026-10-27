import { connect } from 'react-redux'
import { TransitOperator } from '@opentripplanner/types'
import React from 'react'

import { AppReduxState } from '../../util/state-types'
import { FETCH_STATUS } from '../../util/constants'

import { StopData } from './types'
import TransitOperatorLogos from './transit-operator-icons'

interface Props {
  agencies: Set<string>
  stopData?: StopData
  transitOperators: TransitOperator[]
}

function TransitOperatorIcons({ agencies, stopData, transitOperators }: Props) {
  const loading = stopData?.fetchStatus === FETCH_STATUS.FETCHING
  return (
    <TransitOperatorLogos
      agencies={agencies}
      loading={loading}
      transitOperators={transitOperators}
    />
  )
}

const mapStateToProps = (
  state: AppReduxState,
  ownProps: Props & { stopId: string }
) => {
  const stops = state.otp.transitIndex.stops
  const areaStops = state.otp.transitIndex.areaStops
  const regularStop = stops[ownProps.stopId]
  const areaStop = areaStops[ownProps.stopId]
  const agencies = regularStop
    ? regularStop.stoptimesForPatterns?.reduce((prev, cur) => {
        const agencyGtfsId = cur.pattern.route.agency?.gtfsId
        return agencyGtfsId ? prev.add(agencyGtfsId) : prev
      }, new Set())
    : areaStop
    ? areaStop.routes?.reduce((prev, cur) => {
        const agencyGtfsId = cur.agency?.gtfsId
        return agencyGtfsId ? prev.add(agencyGtfsId) : prev
      }, new Set())
    : new Set()

  console.log(areaStop, agencies)

  return {
    agencies,
    stopData: regularStop || areaStop,
    transitOperators: state.otp.config.transitOperators || []
  }
}

export default connect(mapStateToProps)(TransitOperatorIcons)
