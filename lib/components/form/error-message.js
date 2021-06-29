import React from 'react'
import { connect } from 'react-redux'

import TripTools from '../narrative/trip-tools'
import { getActiveError, getErrorMessage } from '../../util/state'

const ErrorMessage = ({ message }) => {
  if (!message) return null

  return (
    <div className='error-message'>
      <div className='header'>
        <i className='fa fa-exclamation-circle' /> Could Not Plan Trip
      </div>
      <div className='message'>{message}</div>
      <TripTools buttonTypes={['START_OVER', 'REPORT_ISSUE']} />
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    message: getErrorMessage(
      getActiveError(state),
      state.otp.config.errorMessages
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessage)
