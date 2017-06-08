import React, {PropTypes, Component} from 'react'
import { Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setOptimize } from '../../actions/form'

class OptimizeSelector extends Component {
  static propTypes = {
    optimize: PropTypes.string,
    setOptimize: PropTypes.func
  }

  render () {
    const { optimize } = this.props

    const options = [{
      text: 'Speed',
      value: 'QUICK'
    }, {
      text: 'Transfers',
      value: 'TRANSFERS'
    }]

    return (
      <Form>
        <FormGroup style={{marginBottom: '15px'}} className='date-time-selector'>
          <Row>
            <Col xs={6} className='setting-label'>
              Optimize for
            </Col>
            <Col xs={6}>
              <FormControl
                componentClass='select'
                value={optimize}
                onChange={(evt) => {
                  this.props.setOptimize(evt.target.value)
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
  const { optimize } = state.otp.currentQuery
  return {
    optimize
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setOptimize: (optimize) => { dispatch(setOptimize({ optimize })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OptimizeSelector)
