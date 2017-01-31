import React, { Component, PropTypes } from 'react'
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import { connect } from 'react-redux'

class LocationField extends Component {

  static propTypes = {
    location: PropTypes.object,
    label: PropTypes.string,
    onChange: PropTypes.func
  }

  render () {
    return (
      <form>
        <FormGroup>
          <ControlLabel>{this.props.label || this.props.fieldName}</ControlLabel>
          <FormControl
            type='text'
            value={this.props.location.name}
            placeholder='Enter location'
            onChange={() => this.props.onChange}
          />
        </FormGroup>
      </form>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    location: state.otp.currentQuery[ownProps.fieldName]
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChange: () => { }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationField)
