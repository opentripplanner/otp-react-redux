import { FormattedMessage } from 'react-intl'

/**
 * Returns a FormattedMessage component for a yup validation error in order to
 * keep react-intl message IDs hardcoded.
 */
export default function FormattedValidationError ({type}) {
  switch (type) {
    case 'invalid-address':
      return <FormattedMessage id='components.FavoritePlaceScreen.invalidAddress' />
    case 'invalid-name':
      return <FormattedMessage id='components.FavoritePlaceScreen.invalidName' />
    case 'trip-name-already-used':
      return <FormattedMessage id='components.SavedTripScreen.tripNameAlreadyUsed' />
    case 'trip-name-required':
      return <FormattedMessage id='components.SavedTripScreen.tripNameRequired' />
    default:
      return null
  }
}
