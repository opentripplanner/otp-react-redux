// import necessary React/Redux libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup } from 'react-bootstrap'

import DateTimeSelector from './date-time-selector'
import { setQueryParam } from '../../actions/form'

// Define default routingType labels and components
const rtDefaults = [
  {
    key: 'ITINERARY',
    text: 'Itinerary',
    component: <DateTimeSelector />
  }, {
    key: 'PROFILE',
    text: 'Profile',
    component: <DateTimeSelector profile />
  }
]

class DateTimeModal extends Component {
  static propTypes = {
    routingType: PropTypes.string,
    setQueryParam: PropTypes.func
  }

  render () {
    const { config, routingType, setQueryParam } = this.props

    return (
      <div className='date-time-modal'>
        {/* The routing-type selection button row. Only show if more than one configured */}
        {config.routingTypes.length > 1 && (
          <div className='button-row'>
            <ButtonGroup justified>
              {config.routingTypes.map(rtConfig => {
                return (
                  <ButtonGroup key={rtConfig.key}>
                    <Button
                      className={rtConfig.key === routingType ? 'selected' : ''}
                      onClick={() => {
                        setQueryParam({ routingType: rtConfig.key })
                      }}
                    >
                      {rtConfig.text || rtDefaults.find(d => d.key === rtConfig.key).text}
                    </Button>
                  </ButtonGroup>
                )
              })}
            </ButtonGroup>
          </div>
        )}

        {/* The main panel for the selected routing type */}
        <div className='main-panel'>
          {rtDefaults.find(d => d.key === routingType).component}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const {departArrive, date, time, routingType} = state.otp.currentQuery
  return {
    config: state.otp.config,
    departArrive,
    date,
    time,
    routingType
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)
