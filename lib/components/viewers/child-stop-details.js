import React, { Component } from 'react'

import { getRouteIdForPattern, getStopTimesByPattern, routeIsValid } from '../../util/viewer'
import Icon from '../narrative/icon'

import NextArrivalForPattern from './next-arrival-for-pattern'
import ViewStopButton from './view-stop-button'

class ChildStopDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  renderChildStopsList = () => {
    const {
      childStops,
      homeTimezone,
      stopViewerArriving,
      stopViewerConfig,
      timeFormat
    } = this.props
    return (
      <ul className='child-stop-list'>
        {childStops?.map((stop, index) => {
          if (!this.state.expanded && index >= 2) return null
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
    )
  }

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  render () {
    const { childStops } = this.props
    return (
      <>
        <h4 className='child-stops-title'>Related Stops</h4>
        <div className='child-stop-container'>
          {this.renderChildStopsList()}
        </div>
        {childStops && childStops.length && (
          <button
            className='child-stop-expand-view'
            onClick={this._toggleExpandedView}
          >
            {this.state.expanded
              ? 'Hide extra stops'
              : 'Show ' + (childStops.length - 2) + ' extra stops'
            }
          </button>
        )}
      </>
    )
  }
}

export default ChildStopDetails
