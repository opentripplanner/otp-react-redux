import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class ModesPanel extends Component {
  static propTypes = {
    modeGroups: PropTypes.array
  }

  render () {
    return (
      <div className='modes-panel'>
        {this.props.modeGroups.map((group, k) => {
          return (
            <div className='mode-group-row' key={k}>
              <div className='group-name'>{group.name}</div>
              {group.modes.map(mode => {
                return (
                  <div key={mode} className={`mode-icon icon-mode-${mode.toLowerCase()}`} />
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
    modeGroups: state.otp.config.modeGroups
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModesPanel)
