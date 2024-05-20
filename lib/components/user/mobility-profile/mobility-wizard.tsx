import { useIntl } from 'react-intl'
import React from 'react'

import Wizard, { WizardProps } from '../wizard'

/**
 * This component is the mobility profile wizard.
 */
const MobilityWizard = ({ formikProps }: WizardProps): JSX.Element => {
  const intl = useIntl()

  const title = intl.formatMessage({
    id: 'components.MobilityProfile.title'
  })

  return (
    <Wizard
      formikProps={formikProps}
      pages={['mobilityDevices', 'mobilityLimitations']}
      returnTo="/account/settings"
      title={title}
    />
  )
}

export default MobilityWizard
