import React, { Component } from 'react'

import {
  getRouteIdForPattern,
  getStopName,
  getStopTimesByPattern,
  routeIsValid
} from '../../util/viewer'
import Icon from '../narrative/icon'

import NextArrivalForPattern from './next-arrival-for-pattern'
import RelatedPanel from './related-panel'
import ViewStopButton from './view-stop-button'

function RelatedStopsPanel ({
  childStops,
  homeTimezone,
  stopViewerArriving,
  stopViewerConfig,
  timeFormat
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <RelatedPanel
      count={childStops?.length}
      expanded={expanded}
      onToggleExpanded={() => setExpanded(!expanded)}
      title='Related Stops'
    >
        title='Related Stops'
      >
        <ul className='related-items-list list-unstyled'>
          {childStops?.map((stop, index) => {
            const { id } = stop
            if (!expanded && index >= 2) return null
            const stopTimesByPattern = getStopTimesByPattern(stop)
            const label = getStopName(stop)
            return (
              <li className='related-item' key={id}>
                <div className='stop-label'>
                  <div className='stop-name overflow-ellipsis' title={label}>
                    <Icon
                      className='child-stop-icon'
                      type={stop.routes && stop.routes[0].mode.toLowerCase()}
                    />
                    {label}
                  </div>
                  <ViewStopButton
                    className='view-child-stop-button'
                    stopId={stop.id}
                    text='View details'
                  />
                </div>
                <div className='pattern-list'>
                  {Object.values(stopTimesByPattern)
                    .map(({ id, pattern, route, times }, index) => {
                      // Only add pattern if route info is returned by OTP.
                      return routeIsValid(route, getRouteIdForPattern(pattern))
                        ? (
                          <NextArrivalForPattern
                            homeTimezone={homeTimezone}
                            key={id}
                            pattern={pattern}
                            route={route}
                            stopTimes={times}
                            stopViewerArriving={stopViewerArriving}
                            stopViewerConfig={stopViewerConfig}
                            timeFormat={timeFormat}
                          />
                        ) : 'No arrival found'
                    })
                  }
                </div>
              </li>
            )
          })}
        </ul>
      </RelatedPanel>
    )
  }
}

export default RelatedStopsPanel
