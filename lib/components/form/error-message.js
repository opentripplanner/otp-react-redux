import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import TripTools from '../narrative/trip-tools'
import IconWithSpace from '../util/icon-with-space'
import { getActiveError, getErrorMessage } from '../../util/state'

const ErrorMessage = ({ message }) => {
  if (!message) return null

  return (
    <div className='error-message'>
      <div className='header'>
        <IconWithSpace type='exclamation-circle' />
        <FormattedMessage id='components.ErrorMessage.header' />
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
      state.otp.config.errorMessages,
      state.otp.ui.locale
    )
  }
}

export default connect(mapStateToProps)(ErrorMessage)
