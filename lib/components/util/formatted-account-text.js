import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

/**
 * Returns a FormattedMessage component for the account wizard such that i18n IDs
 * are hardcoded and can be kept track of by format.js tools
 */
export default function FormattedAccountText ({key}) {
  switch (key) {
    case 'finish':
      return <FormattedMessage id='common.NewAccountWizard.finish' />
    case 'notifications':
      return <FormattedMessage id='common.NewAccountWizard.notifications' />
    case 'places':
      return <FormattedMessage id='common.NewAccountWizard.places' />
    case 'terms':
      return <FormattedMessage id='common.NewAccountWizard.terms' />
    case 'verify':
      return <FormattedMessage id='common.NewAccountWizard.verify' />
    default:
      return null
  }
}

FormattedAccountText.defaultProps = {
  key: ''
}

FormattedAccountText.propTypes = {
  key: PropTypes.string.isRequired
}
