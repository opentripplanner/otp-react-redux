import React, { Component } from 'react'

import { getRouteIdForPattern, getStopTimesByPattern, routeIsValid } from '../../util/viewer'
import Icon from '../narrative/icon'

import NextArrivalForPattern from './next-arrival-for-pattern'
import RelatedPanel from './related-panel'
import ViewStopButton from './view-stop-button'

class RelatedStopsPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  render () {
    const { expanded } = this.state
    const {
      childStops,
      homeTimezone,
      stopViewerArriving,
      stopViewerConfig,
      timeFormat
    } = this.props
    return (
      <RelatedPanel
        count={childStops?.length}
        expanded={expanded}
        onToggleExpanded={this._toggleExpandedView}
        title='Related Stops'
      >
        <ul className='child-stop-list'>
          {childStops?.map((stop, index) => {
            if (!expanded && index >= 2) return null
            const stopTimesByPattern = getStopTimesByPattern(stop)
            return (
              <div className='child-stop'>
                <div className='child-stop-header'>
                  <div className='overflow-ellipsis' title={stop.name}>
                    <Icon
                      className='child-stop-icon'
                      type={stop.routes && stop.routes[0].mode.toLowerCase()}
                    />
                    {stop.name}
                  </div>
                  <ViewStopButton
                    childStop
                    stopId={stop.id}
                    text='View details'
                  />
                </div>
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
            )
          })}
        </ul>
      </RelatedPanel>
    )
  }
}

export default RelatedStopsPanel
