// import necessary React/Redux libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup } from 'react-bootstrap'

import DateTimeSelector from './date-time-selector'
import { setQueryParam } from '../../actions/form'

class DateTimeModal extends Component {
  static propTypes = {
    planType: PropTypes.string,
    setQueryParam: PropTypes.func
  }

  render () {
    const { planType, setQueryParam } = this.props

    const panels = [
      {
        key: 'ITINERARY',
        text: 'Exact Time',
        component: <DateTimeSelector />
      }, {
        key: 'PROFILE',
        text: 'Time Window',
        component: <DateTimeSelector profile />
      }
    ]

    return (
      <div className='date-time-modal'>
        <div className='button-row'>
          <ButtonGroup justified>
            {panels.map(panel => {
              return (
                <ButtonGroup key={panel.key}>
                  <Button
                    className={panel.key === planType ? 'selected' : ''}
                    onClick={() => {
                      this.setState({ activePanel: panel.key })
                      setQueryParam({ type: panel.key })
                    }}
                  >{panel.text}</Button>
                </ButtonGroup>
              )
            })}
          </ButtonGroup>
        </div>
        <div className='main-panel'>
          {panels.find(p => p.key === planType).component}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const {departArrive, date, time, type} = state.otp.currentQuery
  return {
    config: state.otp.config,
    departArrive,
    date,
    time,
    planType: type
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)
