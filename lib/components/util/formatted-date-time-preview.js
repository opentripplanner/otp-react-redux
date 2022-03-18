// REMOVE THIS LINE BEFORE EDITING THIS FILE
/* eslint-disable  */
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * Returns a FormattedMessage component for date time preview strings such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
 */
const FormattedDateTimePreview = ({
  departArrive,
  endTime,
  routingType,
  startTime,
  time
}) => {
  if (routingType === 'ITINERARY') {
    if (departArrive === 'NOW') {
      return <FormattedMessage id="components.DateTimePreview.leaveNow" />
    } else if (departArrive === 'ARRIVE') {
      return (
        <FormattedMessage
          id="components.DateTimePreview.arriveAt"
          values={{ arriveTime: time }}
        />
      )
    } else if (departArrive === 'DEPART') {
      return (
        <FormattedMessage
          id="components.DateTimePreview.departAt"
          values={{ departTime: time }}
        />
      )
    }
  } else if (routingType === 'PROFILE') {
    return (
      <FormattedMessage
        id="components.DateTimePreview.range"
        values={{ endTime, startTime }}
      />
    )
  }
  return null
}

FormattedDateTimePreview.propTypes = {
  departArrive: PropTypes.string.isRequired,
  routingType: PropTypes.string.isRequired
}

export default FormattedDateTimePreview
