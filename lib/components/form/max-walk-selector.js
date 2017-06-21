import React, {PropTypes, Component} from 'react'
import { Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'

class MaxWalkSelector extends Component {
  static propTypes = {
    maxWalkDistance: PropTypes.number,
    setQueryParam: PropTypes.func
  }

  render () {
    const { maxWalkDistance } = this.props
    const options = [{
      text: '1/10 mile',
      value: 160.9
    }, {
      text: '1/4 mile',
      value: 402.3
    }, {
      text: '1/2 mile',
      value: 804.7
    }, {
      text: '1 mile',
      value: 1609
    }, {
      text: '2 miles',
      value: 3219
    }, {
      text: '5 miles',
      value: 8047
    }]

    return (
      <Form>
        <FormGroup style={{marginBottom: '15px'}} className='date-time-selector'>
          <Row>
            <Col xs={6} className='setting-label'>
              Maximum Walk
            </Col>
            <Col xs={6}>
              <FormControl
                componentClass='select'
                value={maxWalkDistance}
                onChange={(evt) => {
                  this.props.setQueryParam({ maxWalkDistance: evt.target.value })
                }}
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
  const { maxWalkDistance } = state.otp.currentQuery
  return {
    maxWalkDistance
  }
}

const mapDispatchToProps = { setQueryParam }

export default connect(mapStateToProps, mapDispatchToProps)(MaxWalkSelector)
