import { connect } from 'react-redux'
import { useCallback, useEffect, useState } from 'react'

import * as apiActions from '../../actions/api'

interface Props {
  fetchAll?: boolean
  getVehiclePositions: (id?: string) => void
  refreshSeconds: number
  routeId?: string
}

/**
 * Non-visual component that retrieves vehicle positions for the given route.
 */
const VehiclePositionRetriever = ({
  fetchAll,
  getVehiclePositions,
  refreshSeconds,
  routeId
}: Props) => {
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null)

  const refreshVehiclePositions = useCallback(() => {
    if (routeId || fetchAll) {
      getVehiclePositions(routeId)
    }
  }, [routeId, getVehiclePositions, fetchAll])

  useEffect(() => {
    // Fetch vehicle positions when initially mounting component and a route id is available.
    if (routeId || fetchAll) {
      refreshVehiclePositions()

      if (!refreshTimer) {
        // Refresh vehicle positions per interval set in config.
        setRefreshTimer(
          setInterval(refreshVehiclePositions, refreshSeconds * 1000)
        )
      }
    }

    return () => {
      // Stop refreshing vehicle positions for the specified route when this component unmounts.
      if (refreshTimer) {
        clearInterval(refreshTimer)
        setRefreshTimer(null)
      }
    }
  }, [routeId, refreshVehiclePositions, refreshTimer, refreshSeconds, fetchAll])

  // Component renders nothing.
  return null
}

// connect to redux store
const mapStateToProps = (state: any) => {
  return {
    refreshSeconds:
      state.otp.config.routeViewer?.vehiclePositionRefreshSeconds || 10,
    routeId: state.otp.ui.viewedRoute?.routeId
  }
}

const mapDispatchToProps = {
  getVehiclePositions: apiActions.getVehiclePositions
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VehiclePositionRetriever)
