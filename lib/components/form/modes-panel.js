import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'
import ModeButton from './mode-button'

class ModesPanel extends Component {
  static propTypes = {
    icons: PropTypes.object,
    modeGroups: PropTypes.array,
    queryModes: PropTypes.array,
    setQueryParam: PropTypes.func
  }

  render () {
    const {icons, modeGroups, queryModes, setQueryParam} = this.props

    return (
      <div className='modes-panel'>
        {modeGroups.map((group, k) => {
          return (
            <div className='mode-group-row' key={k}>
              <div className='group-name'>{group.name}</div>
              {group.modes.map(mode => {
                const modeSelected = queryModes.indexOf(mode) !== -1
                return <ModeButton
                  active={modeSelected}
                  icons={icons}
                  key={mode}
                  mode={mode}
                  queryModes={queryModes}
                  setMode={setQueryParam}
                />
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

const mapDispatchToProps = { setQueryParam }

export default connect(mapStateToProps, mapDispatchToProps)(ModesPanel)
