import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setShowExtendedSettings } from '../../actions/ui'

class SettingsBar extends Component {
  static propTypes = {
    setShowExtendedSettings: PropTypes.func,
    showExtendedSettings: PropTypes.bool
  }

  render () {
    return (
      <div className='settings-bar'>
        <div className='button-container'>
          <Button
            className='settings-button'
            onClick={() => { this.props.setShowExtendedSettings2(!this.props.showExtendedSettings) }}
          >Settings</Button>
        </div>
        <div className='selected-modes'>All Modes</div>
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    showExtendedSettings: state.otp.ui.showExtendedSettings
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setShowExtendedSettings2: (showExtendedSettings) => {
      dispatch(setShowExtendedSettings({showExtendedSettings}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsBar)
