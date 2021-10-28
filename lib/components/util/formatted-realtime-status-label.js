import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

/**
 * Returns a FormattedMessage component for realtime status labels such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
*/
const FormattedRealtimeStatusLabel = ({minutes, status}) => {
  switch (status) {
    case 'early':
      return <FormattedMessage id='components.RealtimeStatusLabel.early' values={{minutes}} />
    case 'late':
      return <FormattedMessage id='components.RealtimeStatusLabel.late' values={{minutes}} />
    case 'onTime':
      return <FormattedMessage id='components.RealtimeStatusLabel.onTime' />
    case 'scheduled':
      return <FormattedMessage id='components.RealtimeStatusLabel.scheduled' />
    default:
      return null
  }
}

FormattedRealtimeStatusLabel.propTypes = {
  status: PropTypes.string.isRequired
}

FormattedRealtimeStatusLabel.defaultProps = {
  status: ''
}

export default FormattedRealtimeStatusLabel
