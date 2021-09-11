import React, { Component } from 'react'

import {
  getModeFromRoute,
  getRouteIdForPattern,
  getStopName,
  getStopTimesByPattern,
  routeIsValid
} from '../../util/viewer'
import Icon from '../narrative/icon'
import { ComponentContext } from '../../util/contexts'

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

  static contextType = ComponentContext

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  _getStopIcon = (stop) => {
    const { ModeIcon } = this.context
    const modes = [...new Set(stop.routes?.map(getModeFromRoute))]
    if (modes.length === 1) {
      return <ModeIcon height={22} mode={modes[0]} width={22} />
    }
    return <Icon type='map-marker' />
  }

  render () {
    const { expanded } = this.state
    const {
      homeTimezone,
      nearbyStops,
      stopViewerArriving,
      stopViewerConfig,
      timeFormat
    } = this.props
    return (
      <RelatedPanel
        count={nearbyStops?.length}
        expanded={expanded}
        onToggleExpanded={this._toggleExpandedView}
        title='Related Stops'
      >
        <ul className='related-items-list list-unstyled'>
          {nearbyStops?.map((stop, index) => {
            const { id } = stop
            if (!expanded && index >= 2) return null
            const stopTimesByPattern = getStopTimesByPattern(stop)
            const label = getStopName(stop)

            return (
              <li className='related-item' key={id}>
                <div className='stop-label'>
                  <div className='stop-name overflow-ellipsis' title={label}>
                    <span className='child-stop-icon'>
                      {this._getStopIcon(stop)}
                    </span>
                    <span className='stop-name-text'>{label}</span>
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
