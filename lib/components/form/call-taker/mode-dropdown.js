import { toSentenceCase } from '@opentripplanner/core-utils/lib/itinerary'
import React, { Component } from 'react'

export default class ModeDropdown extends Component {
  modeToOptionValue = mode => {
    const {modes} = this.props
    for (let i = 0; i < modes.exclusiveModes.length; i++) {
      if (mode === modes.exclusiveModes[i]) return mode
    }
    for (let i = 0; i < modes.accessModes.length; i++) {
      const accessMode = modes.accessModes[i].mode
      const index = mode.indexOf(accessMode)
      // Set value if mode matches and next character is not an underscore
      // (otherwise we might incorrectly return BICYCLE instead of BICYCLE_RENT).
      if (index !== -1 && mode[index + accessMode.length] !== '_') {
        return `TRANSIT,${accessMode}`
      }
    }
    // Default to transit
    return 'TRANSIT'
  }

  _getModeOptions = () => {
    const {modes} = this.props
    return [
      { mode: 'TRANSIT', value: 'TRANSIT', children: 'Transit' },
      ...modes.exclusiveModes.map(mode =>
        ({ mode, value: `${mode}`, children: `${toSentenceCase(mode)} only` })
      ),
      ...modes.accessModes.map(m =>
        ({ ...m, value: `TRANSIT,${m.mode}`, children: m.label })
      )
    ]
  }

  _onChange = evt => {
    const {value: mode} = evt.target
    const {updateTransitModes} = this.props
    // Find selected option.
    let selectedOption
    this._getModeOptions().forEach(option => {
      if (option.value === mode) selectedOption = option
    })
    const transitIsSelected = mode.indexOf('TRANSIT') !== -1
    if (transitIsSelected) {
      // Collect transit modes and selected access mode.
      const accessMode = mode === 'TRANSIT' ? 'WALK' : mode.replace('TRANSIT,', '')
      // If no transit is selected, selected all available. Otherwise, default
      // to state.
      const transitModes = this.props.selectedTransitModes.length > 0
        ? this.props.selectedTransitModes
        : this.props.modes.transitModes.map(m => m.mode)
      const newModes = [...transitModes, accessMode]
      if (accessMode.indexOf('CAR') !== -1) newModes.push('WALK')
      updateTransitModes(transitModes)
      const params = { mode: newModes.join(',') }
      // Update companies if provided by selected option.
      if (selectedOption && selectedOption.company) {
        params.companies = selectedOption.company
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
        {this._getModeOptions().map(o => (
          <option key={o.value} {...o} />
        ))}
      </select>
    )
  }
}
