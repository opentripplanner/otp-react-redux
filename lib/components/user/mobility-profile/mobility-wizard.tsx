import { FormikProps } from 'formik'
import { useIntl } from 'react-intl'
import React from 'react'

import { EditedUser } from '../types'
import Wizard from '../common/wizard'

// The props include Formik props that provide access to the current user data (stored in props.values)
// and to its own blur/change/submit event handlers that automate the state.
// We forward the props to each pane (via SequentialPaneDisplay) so that their individual controls
// can be wired to be managed by Formik.
interface Props extends FormikProps<EditedUser> {
  activePaneId: string
  basePath: string
  onCreate: (value: EditedUser) => void
  panes: PaneProps[]
  routeTo: (to: string) => void
}

/**
 * This component is the new account wizard.
 */
const MobilityWizard = ({
  activePaneId,
  panes,
  ...formikProps // provided by Formik
}: Props): JSX.Element => {
  const intl = useIntl()

  const title = intl.formatMessage({
    id: 'components.MobilityProfile.title'
  })

  return (
    <Wizard
      activePaneId={activePaneId}
      formikProps={formikProps}
      originRoute="/account/settings"
      pages={['mobility1', 'mobility2']}
      paneProps={formikProps}
      title={title}
    />
  )
}

export default MobilityWizard
