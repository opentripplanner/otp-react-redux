import { FormattedMessage } from 'react-intl'
import React, { useEffect, useState } from 'react'

import { InlineLoading } from '../narrative/loading'

import FormNavigationButtons, { ButtonType } from './form-navigation-buttons'
import StackedPanes, { Props as StackedPanesProps } from './stacked-panes'

interface Props extends StackedPanesProps {
  extraButton?: ButtonType
  onCancel: () => void
}

/**
 * This component handles the flow between screens for new OTP user accounts.
 *
 * TODO: add types once Pane type exists
 */
const StackedPanesWithSave = ({
  extraButton,
  onCancel,
  panes,
  title
}: Props): JSX.Element => {
  // Create indicator of if cancel button was clicked so that child components can know
  const [isBeingCanceled, updateBeingCanceled] = useState(false)
  const [buttonClicked, setButtonClicked] = useState('')

  useEffect(() => {
    setButtonClicked('')
  }, [panes])

  return (
    <>
      <StackedPanes canceling={isBeingCanceled} panes={panes} title={title} />

      <FormNavigationButtons
        backButton={{
          disabled: buttonClicked === 'okay',
          onClick: () => {
            setButtonClicked('back')
            updateBeingCanceled(true)
            onCancel()
          },
          text:
            buttonClicked === 'back' ? (
              <InlineLoading />
            ) : (
              <FormattedMessage id="common.forms.cancel" />
            )
        }}
        extraButton={extraButton}
        okayButton={{
          disabled: buttonClicked === 'okay',
          onClick: () => {
            // Some browsers need this to happen after the formik action finishes firing
            setTimeout(() => setButtonClicked('okay'), 10)
          },
          text:
            buttonClicked === 'okay' ? (
              <InlineLoading />
            ) : (
              <FormattedMessage id="components.StackedPaneDisplay.savePreferences" />
            ),
          type: 'submit'
        }}
      />
    </>
  )
}
export default StackedPanesWithSave
