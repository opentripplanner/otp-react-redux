import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import ModeIcon from '../icons/mode-icon'

import { setShowExtendedSettings } from '../../actions/ui'

class SettingsBar extends Component {
  static propTypes = {
    // state
    modeGroups: PropTypes.array,
    queryModes: PropTypes.array,
    showExtendedSettings: PropTypes.bool,

    // dispatch
    setShowExtendedSettings: PropTypes.func
  }

  render () {
    let totalModeCount = 0
    this.props.modeGroups.forEach(g => { totalModeCount += g.modes.length })

    const selectedModeCount = this.props.queryModes.length

    return (
      <div className='settings-bar'>
        <div className='button-container'>
          <Button
            className='settings-button'
            onClick={() => { this.props.setShowExtendedSettings(!this.props.showExtendedSettings) }}
          >Settings</Button>
        </div>
        <div className='selected-modes'>
          {selectedModeCount === totalModeCount
            ? <div className='all-selected'>All Modes Selected</div>
            : <div className='some-selected'>
                <div className='some-selected-label'>{selectedModeCount} Modes Selected</div>
                <div className='some-selected-modes'>
                  {this.props.queryModes.map(mode => {
                    return <div className='mode-icon'><ModeIcon mode={mode} /></div>
                  })}
                </div>
              </div>
          }
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    showExtendedSettings: state.otp.ui.showExtendedSettings,
    modeGroups: state.otp.config.modeGroups,
    queryModes: state.otp.currentQuery.mode.split(',')
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setShowExtendedSettings: (showExtendedSettings) => {
      dispatch(setShowExtendedSettings({showExtendedSettings}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsBar)
