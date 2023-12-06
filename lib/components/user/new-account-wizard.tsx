import { connect } from 'react-redux'
import { FormikProps } from 'formik'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'

import { AppReduxState } from '../../util/state-types'

import { EditedUser } from './types'
import Wizard from './common/wizard'

// The props include Formik props that provide access to the current user data (stored in props.values)
// and to its own blur/change/submit event handlers that automate the state.
// We forward the props to each pane (via SequentialPaneDisplay) so that their individual controls
// can be wired to be managed by Formik.
interface Props extends FormikProps<EditedUser> {
  activePaneId: string
  onCreate: (value: EditedUser) => void
  pages: string[]
}

/**
 * This component is the new account wizard.
 */
const NewAccountWizard = ({
  activePaneId,
  onCreate, // provided by UserAccountScreen
  pages,
  ...formikProps // provided by Formik
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

// Get the new account pages configuration, if any, from redux state.
const mapStateToProps = (state: AppReduxState, ownProps: Props) => {
  return {
    pages: state.otp.config.newAccountPages || [
      'terms',
      'notifications',
      'places',
      'finish'
    ]
  }
}

export default connect(mapStateToProps)(NewAccountWizard)
