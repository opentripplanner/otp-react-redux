import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * Returns a FormattedMessage component for transit vehicle status msgs such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
 */
const FormattedTransitVehicleStatus = ({ stop, stopStatus }) => {
  switch (stopStatus) {
    case 'incoming_at':
      return (
        <FormattedMessage
          id="components.TransitVehicleOverlay.incoming_at"
          values={{ stop }}
        />
      )
    case 'in_transit_to':
      return (
        <FormattedMessage
          id="components.TransitVehicleOverlay.in_transit_to"
          values={{ stop }}
        />
      )
    case 'stopped_at':
      return (
        <FormattedMessage
          id="components.TransitVehicleOverlay.stopped_at"
          values={{ stop }}
        />
      )
    default:
      return null
  }
}

FormattedTransitVehicleStatus.propTypes = {
  stop: PropTypes.string.isRequired,
  stopStatus: PropTypes.string.isRequired
}

FormattedTransitVehicleStatus.defaultProps = {
  stop: '',
  stopStatus: ''
}

export default FormattedTransitVehicleStatus
