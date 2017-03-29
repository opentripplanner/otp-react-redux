import React, { Component, PropTypes } from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setMode } from '../../actions/form'

class ModeSelector extends Component {
  static propTypes = {
    location: PropTypes.object,
    label: PropTypes.string,
    setLocation: PropTypes.func,
    type: PropTypes.string // replace with locationType?
  }
  _onChange = (evt) => {
    const mode = evt.target.value
    this.props.setMode({mode})
  }
  render () {
    const { config, mode } = this.props
    return (
      <form>
        <FormGroup>
          <ControlLabel>Mode:</ControlLabel>
          <FormControl
            componentClass='select'
            value={mode}
            onChange={this._onChange}
          >
            {config.modes.map((m, i) => (
              <option key={i} value={m}>{m}</option>
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

const mapDispatchToProps = {setMode}

export default connect(mapStateToProps, mapDispatchToProps)(ModeSelector)
