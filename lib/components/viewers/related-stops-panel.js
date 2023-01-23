/* eslint-disable react/prop-types */
import { FormattedMessage } from 'react-intl'
import { MapMarker } from '@styled-icons/fa-solid/MapMarker'
import React, { Component } from 'react'

import { ComponentContext } from '../../util/contexts'
import {
  getModeFromRoute,
  getRouteColorBasedOnSettings,
  getRouteIdForPattern,
  getStopName,
  getStopTimesByPattern,
  routeIsValid
} from '../../util/viewer'

import NextArrivalForPattern from './next-arrival-for-pattern'
import RelatedPanel from './related-panel'
import ViewStopButton from './view-stop-button'

class RelatedStopsPanel extends Component {
  constructor(props) {
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
    return <MapMarker size={22} />
  }

  render() {
    const { expanded } = this.state
    const {
      homeTimezone,
      nearbyStops,
      setHoveredStop,
      stopViewerArriving,
      stopViewerConfig,
      transitOperators
    } = this.props
    if (nearbyStops?.length === 0) {
      return null
    }
    return (
      <RelatedPanel
        count={nearbyStops?.length}
        expanded={expanded}
        onToggleExpanded={this._toggleExpandedView}
        title={
          <FormattedMessage id="components.RelatedStopsPanel.relatedStops" />
        }
        // FIXME: this needs to ideally change with the string length...
        titleWidth="13ch"
      >
        <ul className="related-items-list list-unstyled">
          {nearbyStops?.map((stop, index) => {
            const { id } = stop
            if (!expanded && index >= 2) return null
            const stopTimesByPattern = getStopTimesByPattern(stop)
            const label = getStopName(stop)

            if (Object.keys(stopTimesByPattern).length === 0) {
              return null
            }

            return (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
              <li
                className="related-item"
                key={id}
                onFocus={() => setHoveredStop(stop.id)}
                onMouseDown={() => setHoveredStop(null)}
                onMouseLeave={() => setHoveredStop(null)}
                onMouseOver={() => setHoveredStop(stop.id)}
              >
                <div className="stop-label">
                  <div className="stop-name" title={label}>
                    <span className="child-stop-icon">
                      {this._getStopIcon(stop)}
                    </span>
                    <span className="stop-name-text">{label}</span>
                  </div>
                  <ViewStopButton
                    className="view-child-stop-button"
                    stopId={stop.id}
                    text={
                      <FormattedMessage id="components.RelatedStopsPanel.viewDetails" />
                    }
                  />
                </div>
                <div className="pattern-list" role="list">
                  {Object.values(stopTimesByPattern).map(
                    ({ id, pattern, route, times }, index) => {
                      // Only add pattern if route info is returned by OTP.
                      return routeIsValid(
                        route,
                        getRouteIdForPattern(pattern)
                      ) ? (
                        <NextArrivalForPattern
                          homeTimezone={homeTimezone}
                          key={id}
                          pattern={pattern}
                          route={route}
                          routeColor={getRouteColorBasedOnSettings(
                            transitOperators.find(
                              (to) => to.agencyId === route.agency.id
                            ),
                            route
                          )}
                          stopTimes={times}
                          stopViewerArriving={stopViewerArriving}
                          stopViewerConfig={stopViewerConfig}
                        />
                      ) : (
                        <FormattedMessage id="components.RelatedStopsPanel.noArrivalFound" />
                      )
                    }
                  )}
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
