import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import ModeIcon from '../icons/mode-icon'

import { setMode } from '../../actions/form'

class ModesPanel extends Component {
  static propTypes = {
    modeGroups: PropTypes.array,
    queryModes: PropTypes.array,
    setMode: PropTypes.func
  }

  render () {
    const {modeGroups, queryModes} = this.props

    return (
      <div className='modes-panel'>
        {modeGroups.map((group, k) => {
          return (
            <div className='mode-group-row' key={k}>
              <div className='group-name'>{group.name}</div>
              {group.modes.map(mode => {
                const modeSelected = queryModes.indexOf(mode) !== -1
                return (
                  <div key={mode} className='mode-icon-highlight'>
                    <button
                      onClick={() => {
                        if (modeSelected) {
                          this.props.setMode(queryModes.filter(m => m !== mode).join(','))
                        } else {
                          queryModes.push(mode)
                          this.props.setMode(queryModes.join(','))
                          console.log('adding ' + mode)
                        }
                      }}
                    >
                      <div className='mode-icon'
                        style={{ fill: modeSelected ? 'red' : '#bbb' }}
                      >
                        <ModeIcon mode={mode} />
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    modeGroups: state.otp.config.modeGroups,
    queryModes: state.otp.currentQuery.mode.split(',')
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setMode: (mode) => { dispatch(setMode({ mode })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModesPanel)
