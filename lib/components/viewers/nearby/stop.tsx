import { useIntl } from 'react-intl'
import React from 'react'

import { StopTime } from '../../util/types'
import LiveStopTimes from '../live-stop-times'

const Stop = ({
  setHoveredStop,
  showOperatorLogo,
  stopData,
  transitOperators
}: {
  setHoveredStop: () => void
  showOperatorLogo: boolean
  stopData: any
  transitOperators: any
}): JSX.Element => {
  const intl = useIntl()

  // TODO: Let's have some typescript here first that'll help
  stopData.stoptimesForPatterns.route.map((st: any, index: number) => {
    return <b key={index}>{st.code}</b>
  })
  return <>nothing</>
  // DONT USE THIS!!!!!!!!!!!!!!!
  //   return (
  //     <LiveStopTimes
  //       autoRefreshStopTimes={false}
  //       findStopTimesForStop={() => {
  //         console.log('noooo')
  //       }}
  //       homeTimezone="PDT"
  //       nearbyStops={null}
  //       setHoveredStop={() => {
  //         console.log('yessss')
  //       }}
  //       showNearbyStops={false}
  //       showOperatorLogo
  //       stopData={stopData}
  //       stopViewerArriving={null}
  //       stopViewerConfig={{ timerange: 0 }}
  //       toggleAutoRefresh={() => false}
  //       transitOperators={[]}
  //     />
  //   )
}

export default Stop
