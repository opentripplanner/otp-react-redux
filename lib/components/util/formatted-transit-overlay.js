import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

/**
 * Returns a FormattedMessage component for transit vehicle overlay msgs such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
*/
const FormattedTransitOverlay = ({stop, stopStatus}) => {
  switch (stopStatus) {
    case 'incoming_at':
      return <FormattedMessage id='components.TransitVehicleOverlay.incoming_at' values={{stop}} />
    case 'in_transit_to':
      return <FormattedMessage id='components.TransitVehicleOverlay.in_transit_to' values={{stop}} />
    case 'stopped_at':
      return <FormattedMessage id='components.TransitVehicleOverlay.stopped_at' values={{stop}} />
    default:
      return null
  }
}

FormattedTransitOverlay.propTypes = {
  stop: PropTypes.string.isRequired,
  stopStatus: PropTypes.string.isRequired
}

FormattedTransitOverlay.defaultProps = {
  stop: '',
  stopStatus: ''
}

export default FormattedTransitOverlay
