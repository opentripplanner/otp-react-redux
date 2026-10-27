import { connect } from 'react-redux'

import { AppReduxState } from '../../util/state-types'
import { FETCH_STATUS } from '../../util/constants'

import { RouteWithAgencyGtfsId, StopTime } from './types'
import TransitOperatorLogos from './transit-operator-icons'

interface Props {
  stopId: string
}

function getAgencies(routes: RouteWithAgencyGtfsId[]): Set<string> {
  return routes?.reduce((prev, cur) => {
    const agencyGtfsId = cur.agency?.gtfsId
    return agencyGtfsId ? prev.add(agencyGtfsId) : prev
  }, new Set<string>())
}

const mapStateToProps = (state: AppReduxState, { stopId }: Props) => {
  const { areaStops, stops } = state.otp.transitIndex
  const regularStop = stops[stopId]
  const areaStop = areaStops[stopId]
  const stopData = regularStop || areaStop
  const agencies = regularStop
    ? getAgencies(
        regularStop.stoptimesForPatterns?.map(
          (st: StopTime) => st.pattern.route
        )
      )
    : areaStop
    ? getAgencies(areaStop.routes)
    : new Set<string>()

  return {
    agencies,
    loading: stopData?.fetchStatus === FETCH_STATUS.FETCHING,
    transitOperators: state.otp.config.transitOperators || []
  }
}

export default connect(mapStateToProps)(TransitOperatorLogos)
