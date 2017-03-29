import Icon from './icon'
import React, { Component, PropTypes } from 'react'
import { Label } from 'react-bootstrap'

import ModeIcon from './mode-icon'
import { getMapColor } from '../../util/itinerary'
import { formatDuration } from '../../util/time'

export default class TransitLeg extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  _onLegClick (e, leg, index) {
    if (this.props.active) {
      this.props.setActiveLeg({index: null})
    } else {
      this.props.setActiveLeg({index, leg})
    }
  }

  _onClick = () => {
    this.setState({expanded: !this.state.expanded})
  }
  render () {
    const { active, index, leg } = this.props
    const { expanded } = this.state
    const numStops = leg.to.stopIndex - leg.from.stopIndex - 1
    return (
      <div
        className={`leg${active ? ' active' : ''}`}>
        <button
          className={`header`}
          onClick={(e) => this._onLegClick(e, leg, index)}
          >
          {leg.realTime ? <Icon type='rss' /> : null}
          <span><Label>{leg.routeShortName}</Label> <b>{leg.routeLongName}</b> {leg.headsign}</span>
        </button>
        <div className='step-by-step'>
          <div className='transit-leg'>
            <div className='from-stop'>
              <ModeIcon mode={leg.mode} />{leg.from.name}
            </div>
            <div className='intermediate-stops'>
              <div
                className='stop-count'
                style={{borderLeft: `3px solid ${getMapColor(leg.mode)}`}}
                >
                <button
                  onClick={this._onClick}
                  >
                  <Icon type={`caret-${expanded ? 'down' : 'right'}`} />
                  <span className='transit-duration'>{formatDuration(leg.duration)}</span>
                  {' '}
                  ({numStops ? `${numStops} stops` : 'non-stop'})
                </button>
                {leg.alerts &&
                  <div>
                    <div className='item'><Icon type='exclamation-circle' /> Information</div>
                    {expanded &&
                      <div>
                        {leg.alerts.map((alert, i) => (
                          <div className='alert-item item' key={i}>{alert.alertDescriptionText} {alert.alertUrl ? <a target='_blank' href={alert.alertUrl}>more info</a> : null}</div>
                        ))}
                      </div>
                    }
                  </div>
                }
              </div>
              {expanded &&
                <div>
                  <div
                    style={{borderLeft: `3px solid ${getMapColor(leg.mode)}`}}
                    className='stop-list'>
                    {leg.intermediateStops.map((s, i) => (
                      <div key={i} className='stop-item item'>
                        <span className='stop-bullet'
                          style={{
                            color: getMapColor(leg.mode),
                            fontWeight: 800,
                            paddingRight: '8px',
                            marginLeft: '-1px'
                          }}
                          >-</span>
                        <span className='stop-name'>{s.name}</span>
                      </div>
                    ))}
                    <div className='item info-item'>
                      <span className='agency-info'>Service operated by <a href={leg.agencyUrl}>{leg.agencyName}</a></span>
                      {
                        // route info included?
                        // <span className='route-info'><a target='_blank' href={leg.routeUrl}>Route information</a></span>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
            <div className='to-stop'>
              <ModeIcon mode={leg.mode} />{leg.to.name}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
