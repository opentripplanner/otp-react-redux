import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'

import { AppReduxState } from '../../util/state-types'

import { EditedUser } from './types'
import Wizard, { WizardProps } from './wizard'

interface Props extends WizardProps {
  onCreate: (value: EditedUser) => void
  pages: string[]
}

/**
 * This component is the new account wizard.
 */
const NewAccountWizard = ({
  activePaneId,
  formikProps,
  onCreate,
  pages
}: Props): JSX.Element => {
  const { values: userData } = formikProps
  const intl = useIntl()

  const handleNext = useCallback(() => {
    if (activePaneId === 'terms') {
      // Create a user record only if an id is not assigned.
      if (!userData.id) {
        onCreate(userData)
      }
    }
  }, [activePaneId, onCreate, userData])

  const title = intl.formatMessage({
    id: 'components.NewAccountWizard.createNewAccount'
  })

  return (
    <Wizard
      activePaneId={activePaneId}
      formikProps={formikProps}
      onNext={handleNext}
      pages={pages}
      title={title}
    />
  )
}

// Get the new account pages based on the configuration's mobilityProfile flag.
const mapStateToProps = (state: AppReduxState) => {
  return {
    pages: state.otp.config.mobilityProfile
      ? [
          'terms',
          'mobilityDevices',
          'mobilityLimitations',
          'notifications',
          'places',
          'finish'
        ]
      : ['terms', 'notifications', 'places', 'finish']
  }
}

export default connect(mapStateToProps)(NewAccountWizard)
