import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Form, FormGroup, Row, Col, Checkbox } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'

class CheckboxSelector extends Component {
  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool
    ]),
    label: PropTypes.string,
    setQueryParam: PropTypes.func
  }

  _onQueryParamChange = (evt) => {
    this.props.setQueryParam({ [this.props.name]: evt.target.checked })
  }

  render () {
    const { label } = this.props
    let value = this.props.value
    if (typeof value === 'string') value = (value === 'true')

    return (
      <div>
        <Row>
          <Col xs={12} className='setting-label'>
            <Form>
              <FormGroup>
                <Checkbox checked={value} style={{ margin: 'none' }} onChange={this._onQueryParamChange}>{label}</Checkbox>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = { setQueryParam }

export default connect(mapStateToProps, mapDispatchToProps)(CheckboxSelector)
