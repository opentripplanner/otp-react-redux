import React, {PropTypes, Component} from 'react'
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
    this.props.setQueryParam({ [this.props.name]: evt.target.value })
  }

  render () {
    const { value, label, options } = this.props

    return (
      <Form>
        <FormGroup style={{marginBottom: '15px'}} className='date-time-selector'>
          <Row>
            <Col xs={6} className='setting-label'>{label}</Col>
            <Col xs={6}>
              <FormControl
                componentClass='select'
                value={value}
                onChange={this._onQueryParamChange}
              >
                {options.map((o, i) => (
                  <option key={i} value={o.value}>{o.text}</option>
                ))}
              </FormControl>
            </Col>
          </Row>
        </FormGroup>
      </Form>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = { setQueryParam }

export default connect(mapStateToProps, mapDispatchToProps)(DropdownSelector)
