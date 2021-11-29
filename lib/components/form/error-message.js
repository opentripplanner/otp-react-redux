import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'

import TripTools from '../narrative/trip-tools'
import Icon from '../util/icon'
import { getActiveError, getErrorMessage } from '../../util/state'

const ErrorMessage = ({ error, message }) => {
  const intl = useIntl()
  message = message || getErrorMessage(error, intl)
  if (!message) return null

  return (
    <div className='error-message'>
      <div className='header'>
        <Icon type='exclamation-circle' />
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
    error: getActiveError(state)
  }
}

export default connect(mapStateToProps)(ErrorMessage)
