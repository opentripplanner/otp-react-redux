import { connect } from 'react-redux'

import { AppReduxState } from '../../util/state-types'
import { FETCH_STATUS } from '../../util/constants'

import { RouteWithAgencyGtfsId, StopData, StopTime } from './types'
import TransitOperatorLogos from './transit-operator-icons'

interface Props {
  stopData?: StopData
  stopId?: string
}

function getAgencies(routes: RouteWithAgencyGtfsId[]): Set<string> {
  return routes?.reduce((prev, cur) => {
    const agencyGtfsId = cur.agency?.gtfsId
    return agencyGtfsId ? prev.add(agencyGtfsId) : prev
  }, new Set<string>())
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

  return {
    agencies,
    loading: (regStop || areaStop)?.fetchStatus === FETCH_STATUS.FETCHING,
    transitOperators: state.otp.config.transitOperators || []
  }
}

export default connect(mapStateToProps)(TransitOperatorLogos)
