import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'
import ModeButton from './mode-button'
import { isAccessMode } from '../../util/itinerary'

class ModesPanel extends Component {
  static propTypes = {
    icons: PropTypes.object,
    modeGroups: PropTypes.array,
    queryModes: PropTypes.array,
    setQueryParam: PropTypes.func
  }

  _setGroupSelected (group, isSelected) {
    let queryModes = this.props.queryModes.slice(0) // Clone the modes array

    group.modes.forEach(mode => {
      const modeStr = mode.mode || mode
      queryModes = queryModes.filter(m => m !== modeStr)
      if (isSelected) queryModes.push(modeStr)
    })

    // Update the mode array in the store
    this.props.setQueryParam({ mode: queryModes.join(',') })
  }

  _toggleMode (mode) {
    const modeStr = mode.mode || mode

    const { routingType, setQueryParam } = this.props
    let queryModes = this.props.queryModes.slice(0) // Clone the modes array

    // Special case: we are in ITINERARY mode and changing the one access mode
    if (routingType === 'ITINERARY' && isAccessMode(modeStr)) {
      queryModes = queryModes.filter(m => !isAccessMode(m))
      queryModes.push(modeStr)

    // Otherwise, if mode is currently selected, deselect it
    } else if (queryModes.includes(modeStr)) {
      queryModes = queryModes.filter(m => m !== modeStr)

    // Or, if mode is currently not selected, select it
    } else if (!queryModes.includes(modeStr)) {
      queryModes.push(modeStr)
    }

    // Update the mode array in the store
    setQueryParam({ mode: queryModes.join(',') })
  }

  render () {
    const { icons, modeGroups, queryModes, routingType } = this.props

    return (
      <div className='modes-panel'>
        {modeGroups.map((group, k) => {
          // Determine whether to show Select/Deselect All actions
          const accessCount = group.modes.filter(m => isAccessMode(m.mode || m)).length
          const showGroupSelect =
            routingType === 'PROFILE' ||
            (routingType === 'ITINERARY' && accessCount === 0)

          return (
            <div className='mode-group-row' key={k}>
              <div className='group-header'>
                {showGroupSelect && (
                  <div className='group-select'>
                    <button className='link-button'
                      onClick={() => this._setGroupSelected(group, true)}
                    >
                      Select All
                    </button>{' '}|{' '}
                    <button className='link-button'
                      onClick={() => this._setGroupSelected(group, false)}
                    >
                      Unselect All
                    </button>
                  </div>
                )}
                <div className='group-name'>{group.name}</div>
              </div>
              <div className='group-icons'>
                {group.modes.map(m => {
                  const modeStr = m.mode || m
                  return <ModeButton
                    active={queryModes.includes(modeStr)}
                    icons={icons}
                    key={modeStr}
                    mode={modeStr}
                    label={m.label || readableModeString(m)}
                    onClick={() => this._toggleMode(modeStr)}
                  />
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}

// Make a mode string more readable (e.g. 'BICYCLE_RENT' -> 'Bicycle Rent')
function readableModeString (mode) {
  const str = mode.replace('_', ' ')
  return str.replace(/\w\S*/g, txt => { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase() })
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { mode, routingType } = state.otp.currentQuery
  return {
    modeGroups: state.otp.config.modeGroups,
    queryModes: !mode || mode.length === 0 ? [] : mode.split(','),
    routingType
  }
}

const mapDispatchToProps = { setQueryParam }

export default connect(mapStateToProps, mapDispatchToProps)(ModesPanel)
