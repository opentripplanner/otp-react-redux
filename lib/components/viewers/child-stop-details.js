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
        <div className='child-stop-container' style={{
          padding: '1rem',
          marginBottom: '1rem' }}>
          <div className='child-stops-header' style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div>
              <Icon type={s.routes && s.routes[0].mode.toLowerCase()} style={{ marginRight: '5px', fontSize: '20px' }} />
              {s.name.charAt(0).toUpperCase()}{s.name.slice(1).toLowerCase()}
            </div>
            <div>
              <ViewStopButton stopId={s.id} text='View details' childStop />
            </div>
          </div>
          <div className='child-stop-footer' style={{
            display: 'flex',
            width: '100%'
          }}>
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
        </div>
      )
    })
    console.log('show2ChildStops', show2ChildStops)

    return (
      <>
        <h4 className='childStops__title' style={{ backgroundColor: '#ffffff', padding: '0.5rem', position: 'relative', width: 'fit-content', marginLeft: '1rem' }}>Related Stops</h4>
        <div className='childstop__details' style={{
          border: '1px solid',
          borderRadius: '7px',
          display: 'flex',
          flexWrap: 'wrap',
          padding: '0.5rem',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: '-2.5rem' }}>
          <ul style={{ padding: '10px', width: '90%', margin: '0' }}>{showChildStops}</ul>
        </div>
      </>
    )
  }
}

export default ChildStopDetails
