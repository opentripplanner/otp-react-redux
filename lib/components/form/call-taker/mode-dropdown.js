import { hasBike, hasTransit } from '@opentripplanner/core-utils/lib/itinerary'
import React, { Component } from 'react'

const modeOptions = [
  {
    // Default option.
    value: 'TRANSIT',
    children: 'Transit'
  },
  {
    value: 'WALK',
    children: 'Walk only'
  },
  {
    value: 'BICYCLE',
    children: 'Bike only'
  },
  {
    value: 'BICYCLE,TRANSIT',
    children: 'Bike to transit'
  },
  {
    value: 'TRANSIT,CAR_HAIL',
    children: 'Uber to transit'
  }
  // {
  //   value: 'TRANSIT,CAR_HAIL,WALK',
  //   children: 'Uber to transit'
  // }
]

export default class ModeDropdown extends Component {
  modeToOptionValue = mode => {
    const isTransit = hasTransit(mode)
    const isBike = hasBike(mode)
    const isCarHail = mode.indexOf('CAR_HAIL') !== -1
    if (isCarHail) return 'TRANSIT,CAR_HAIL'
    else if (isTransit && isBike) return 'BICYCLE,TRANSIT'
    else if (isTransit) return 'TRANSIT'
    // Currently handles bicycle
    else return mode
  }

  _onChange = evt => {
    const {value: mode} = evt.target
    const transitIsSelected = mode.indexOf('TRANSIT') !== -1
    if (transitIsSelected) {
      const modes = mode.split(',')
      const transitIndex = modes.indexOf('TRANSIT')
      modes.splice(transitIndex, 1)
      // Collect transit modes and selected access mode.
      const accessModes = mode === 'TRANSIT' ? ['WALK'] : modes
      // If no transit is selected, selected all available. Otherwise, default
      // to state.
      const transitModes = this.props.selectedTransitModes.length > 0
        ? this.props.selectedTransitModes
        : this.props.modes.transitModes.map(m => m.mode)
      const newModes = [...transitModes, ...accessModes].join(',')
      this.setState({transitModes})
      const params = { mode: newModes }
      if (newModes.indexOf('CAR_HAIL')) {
        // FIXME: Use config companies
        params.companies = 'UBER'
      }
      this.props.onChange(params)
    } else {
      this.props.onChange({ mode })
    }
  }

  render () {
    const {mode, onKeyDown} = this.props
    return (
      <select
        onBlur={this._setMode}
        onKeyDown={onKeyDown}
        value={this.modeToOptionValue(mode)}
        style={{position: 'absolute', right: '60px'}}
        onChange={this._onChange}>
        {modeOptions.map(o => (
          <option key={o.value} {...o} />
        ))}
      </select>
    )
  }
}
