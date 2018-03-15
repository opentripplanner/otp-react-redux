import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { getModeIcon } from '../../util/itinerary'

class SettingsPreview extends Component {
  static propTypes = {
    // component props
    caret: PropTypes.string,
    compressed: PropTypes.bool,
    editButtonText: PropTypes.string,
    icons: PropTypes.object,
    showCaret: PropTypes.bool,
    onClick: PropTypes.func,

    // application state
    modeGroups: PropTypes.array,
    queryModes: PropTypes.array
  }

  static defaultProps = {
    editButtonText: <i className='fa fa-pencil' />
  }

  render () {
    const { caret, editButtonText, icons, modeGroups, queryModes } = this.props

    let totalModeCount = 0
    modeGroups.forEach(g => { totalModeCount += g.modes.length })

    const selectedModeCount = this.props.queryModes.length

    const selectedModes = (
      <div className='selected-modes'>
        {selectedModeCount === totalModeCount
          ? <div className='all-selected'>All Modes Selected</div>
          : (
            <div className='some-selected'>
              <div className='some-selected-label'>{selectedModeCount} Modes Selected</div>
              <div className='some-selected-modes'>
                {queryModes.map(mode => {
                  return <div className='mode-icon' key={mode}>{getModeIcon(mode, icons)}</div>
                })}
              </div>
            </div>
          )
        }
      </div>
    )

    const button = (
      <div className='button-container'>
        <Button className='settings-button' onClick={this.props.onClick}>
          {editButtonText}{caret && <span> <i className={`fa fa-caret-${caret}`} /></span>}
        </Button>
      </div>
    )

    return this.props.compressed
      ? /* 'compressed' layout -- button is below selected mode preview */ (
        <div className='settings-preview compressed'>
          {selectedModes}
          {button}
        </div>
      ) : /* 'wide' layout -- button and selected mode preview are side-by-side  */ (
        <div className='settings-preview wide'>
          {button}
          {selectedModes}
          <div style={{ clear: 'both' }} />
        </div>
      )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    modeGroups: state.otp.config.modeGroups,
    queryModes: state.otp.currentQuery.mode.split(',')
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPreview)
