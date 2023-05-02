import { connect } from 'react-redux'
import { ExclamationCircle } from '@styled-icons/fa-solid/ExclamationCircle'
import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'

import { getActiveError, getErrorMessage } from '../../util/state'
import { IconWithText } from '../util/styledIcon'
import TripTools from '../narrative/trip-tools'

/**
 * A component which renders an error message.
 * @param error   The error to parse and convert to a string
 * @param message The error message to override the error string with
 * @param warning A boolean indicating that the error isn't fatal. Setting this to
 * true will hide the trip re-plan buttons and change the header message.
 */
const ErrorMessage = ({
  error,
  message,
  warning
}: {
  // TODO: Error type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
  message?: string
  warning?: boolean
}) => {
  const intl = useIntl()
  message = message || getErrorMessage(error, intl)
  if (!message) return null

  return (
    <div className="error-message">
      <div className="header">
        <IconWithText Icon={ExclamationCircle}>
          {warning ? (
            <FormattedMessage id="components.ErrorMessage.warning" />
          ) : (
            <FormattedMessage id="components.ErrorMessage.header" />
          )}
        </IconWithText>
      </div>
      <div className="message">{message}</div>
      {/* @ts-expect-error TODO: typescript TripTools */}
      {!warning && <TripTools buttonTypes={['START_OVER', 'REPORT_ISSUE']} />}
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state: unknown) => {
  return {
    error: getActiveError(state)
  }
}

export default connect(mapStateToProps)(ErrorMessage)
