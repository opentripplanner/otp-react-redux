import React, { Component } from 'react'

import { getRouteIdForPattern, getStopTimesByPattern, routeIsValid } from '../../util/viewer'
import Icon from '../narrative/icon'

import NextArrivalForPattern from './next-arrival-for-pattern'
import ViewStopButton from './view-stop-button'

class ChildStopDetails extends Component {
  render () {
    const {
      childStops,
      expanded,
      homeTimezone,
      stopViewerArriving,
      stopViewerConfig,
      timeFormat
    } = this.props

    const show2ChildStops = childStops && childStops.slice(0, 2)
    const childStopsToShow = expanded ? childStops : show2ChildStops

    const showChildStops = childStopsToShow?.map((s, index) => {
      const stopTimesByPattern = getStopTimesByPattern(s)
      return (
        <div className='child-stop'>
          <div className='child-stop-header'>
            <div>
              <Icon type={s.routes && s.routes[0].mode.toLowerCase()} className='child-stop-icon' />
              {s.name.charAt(0).toUpperCase()}{s.name.slice(1).toLowerCase()}
            </div>
            <div>
              <ViewStopButton stopId={s.id} text='View details' childStop />
            </div>
          </div>
          {Object.values(stopTimesByPattern)
            .map(({ id, pattern, route, times }, index) => {
              // Only add pattern if route info is returned by OTP.
              if (index < 1) {
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
                  ) : null
              }
            })
          }
        </div>
      )
    })
    console.log('show2ChildStops', show2ChildStops)

    return (
      <>
        <h4 className='child-stops-title'>Related Stops</h4>
        <div className='child-stop-container'>
          <ul classNAme='child-stop-list'>{showChildStops}</ul>
        </div>
      </>
    )
  }
}

export default ChildStopDetails
