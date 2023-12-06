import { useIntl } from 'react-intl'
import React from 'react'

import Wizard, { WizardProps } from '../common/wizard'

/**
 * This component is the mobility profile wizard.
 */
const MobilityWizard = ({
  activePaneId,
  formikProps
}: WizardProps): JSX.Element => {
  const intl = useIntl()

  const title = intl.formatMessage({
    id: 'components.MobilityProfile.title'
  })

  return (
    <Wizard
      activePaneId={activePaneId}
      formikProps={formikProps}
      pages={['mobility1', 'mobility2']}
      returnTo="/account/settings"
      title={title}
    />
  )
}

export default MobilityWizard
