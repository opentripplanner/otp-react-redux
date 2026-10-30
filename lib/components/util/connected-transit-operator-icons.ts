import { connect } from 'react-redux'
import { TransitOperator } from '@opentripplanner/types'

import { AppReduxState } from '../../util/state-types'
import { FETCH_STATUS } from '../../util/constants'

import { RouteWithAgencyGtfsId, StopData, StopTime } from './types'
import TransitOperatorIcons from './transit-operator-icons'

interface Props {
  stopData?: StopData
  stopId?: string
}

function getAgencies(routes: RouteWithAgencyGtfsId[]): Set<string> {
  return new Set((routes || []).map((r) => r.agency?.gtfsId).filter((r) => !!r))
}

const mapStateToProps = (state: AppReduxState, ownProps: Props) => {
  const { areaStops, stops } = state.otp.transitIndex
  const { stopData, stopId = '' } = ownProps
  const regStop = stopData || stops[stopId]
  const areaStop = areaStops[stopId]
  const agencies = regStop
    ? getAgencies(
        regStop.stoptimesForPatterns?.map((st: StopTime) => st.pattern.route)
      )
    : areaStop
    ? getAgencies(areaStop.routes)
    : new Set<string>()

  const configOperators = state.otp.config.transitOperators || []
  const filteredTransitOperators = configOperators
    .filter((to) => agencies.has(to.agencyId))
    .reduce(
      (prev, to) => {
        if (to.name && !prev.names.has(to.name) && agencies.has(to.agencyId)) {
          prev.names.add(to.name)
          prev.operators.push(to)
        }
        return prev
      },
      { names: new Set<string>(), operators: [] as TransitOperator[] }
    )

  return {
    loading: (regStop || areaStop)?.fetchStatus === FETCH_STATUS.FETCHING,
    transitOperators: filteredTransitOperators.operators
  }
}

export default connect(mapStateToProps)(TransitOperatorIcons)
