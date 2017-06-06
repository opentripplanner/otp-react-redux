// import necessary React/Redux libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {DateTimeSelector, setDepart, setDate, setTime} from 'otp-react-redux'
import { Button, ButtonGroup } from 'react-bootstrap'

class DateTimeModal extends Component {
  static propTypes = {
    setDepart: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = { activePanel: 'ITIN' }
  }

  render () {
    const { activePanel } = this.state

    const panels = [
      {
        key: 'ITIN',
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
                    className={panel.key === activePanel ? 'selected' : ''}
                    onClick={() => this.setState({ activePanel: panel.key })}
                  >{panel.text}</Button>
                </ButtonGroup>
              )
            })}
          </ButtonGroup>
        </div>
        <div className='main-panel'>
          {panels.find(p => p.key === activePanel).component}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const {departArrive, date, time} = state.otp.currentQuery
  return {
    config: state.otp.config,
    departArrive,
    date,
    time
  }
}

const mapDispatchToProps = {
  setDepart,
  setDate,
  setTime
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)
