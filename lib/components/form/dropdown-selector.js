import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'

class DropdownSelector extends Component {
  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    label: PropTypes.string,
    options: PropTypes.array,
    setQueryParam: PropTypes.func
  }

  _onQueryParamChange = (evt) => {
    const val = evt.target.value
    this.props.setQueryParam({
      [this.props.name]: isNaN(val) ? val : parseFloat(val)
    })
  }

  render () {
    const { value, label, options } = this.props

    return (
      <Row>
        <Col xs={6} className='setting-label'>{label}</Col>
        <Col xs={6}>
          <Form>
            <FormGroup className='dropdown-selector-container'>
              <FormControl
                className='dropdown-selector'
                as='select'
                value={value}
                onChange={this._onQueryParamChange}
              >
                {options.map((o, i) => (
                  <option key={i} value={o.value}>{o.text}</option>
                ))}
              </FormControl>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = { setQueryParam }

export default connect(mapStateToProps, mapDispatchToProps)(DropdownSelector)
