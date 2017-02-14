import {Icon} from '@conveyal/woonerf'
import React, { Component, PropTypes } from 'react'

import ModeIcon from './mode-icon'

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
  _onClick = () => {
    this.setState({expanded: !this.state.expanded})
  }
  render () {
    const { leg } = this.props
    const { expanded } = this.state
    return (
      <div className='transit-leg'>
        <div className='from-stop'>
          <ModeIcon mode={leg.mode} />{leg.from.name}
        </div>
        <div className='intermediate-stops'>
          <div
            className='stop-count'
            style={{borderLeft: '3px solid red'}}
            onClick={this._onClick}>
            <Icon type={`caret-${expanded ? 'down' : 'right'}`} />{leg.to.stopIndex - leg.from.stopIndex - 1} stops</div>
          {expanded &&
            <ul
              style={{borderLeft: '3px solid red'}}
              className='stop-list'>
              {leg.intermediateStops.map((s, index) => (
                <li key={index} className='stop-item'>{s.name}</li>
              ))}
            </ul>
          }
        </div>
        <div className='to-stop'>
          <ModeIcon mode={leg.mode} />{leg.to.name}
        </div>
      </div>
    )
  }
}
