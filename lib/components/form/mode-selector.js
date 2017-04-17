import React, { Component, PropTypes } from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setMode } from '../../actions/form'

class ModeSelector extends Component {
  static propTypes = {
    config: PropTypes.object,
    label: PropTypes.string,
    mode: PropTypes.string,
    setMode: PropTypes.func,
    showLabel: PropTypes.boolean
  }

  static defaultProps = {
    label: 'Mode',
    showLabel: true
  }

  _onChange = (evt) => {
    console.log(evt.target.value)
    this.props.setMode(evt.target.value)
  }

  _getDisplayText (mode) {
    switch (mode) {
      case 'TRANSIT,WALK': return 'Walk to Transit'
      case 'TRANSIT,BICYCLE': return 'Bike to Transit'
      case 'WALK': return 'Walk Only'
      case 'BICYCLE': return 'Bike Only'
    }
    return mode
  }

  render () {
    const { config, mode, label, showLabel } = this.props

    return (
      <form>
        <FormGroup className='mode-selector'>
          {showLabel
            ? <ControlLabel>{label}</ControlLabel>
            : null
          }
          <FormControl
            componentClass='select'
            value={mode}
            onChange={this._onChange}
          >
            {config.modes.map((m, i) => (
              <option key={i} value={m}>{this._getDisplayText(m)}</option>
            ))}
          </FormControl>
        </FormGroup>
      </form>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    mode: state.otp.currentQuery.mode
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setMode: (mode) => { dispatch(setMode({ mode })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModeSelector)
