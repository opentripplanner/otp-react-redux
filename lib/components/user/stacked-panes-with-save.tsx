import { FormattedMessage } from 'react-intl'
import React, { useEffect, useState } from 'react'

import { InlineLoading } from '../narrative/loading'

import FormNavigationButtons, { ButtonType } from './form-navigation-buttons'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import StackedPanes, { Props as StackedPanesProps } from './stacked-panes'

interface Props extends StackedPanesProps {
  extraButton?: ButtonType
  isReadOnly?: boolean
  isSubmitting?: boolean
  onCancel: () => void
  subtitle?: string | JSX.Element
}

/**
 * This component handles the flow between screens for new OTP user accounts.
 *
 * TODO: add types once Pane type exists
 */
const StackedPanesWithSave = ({
  extraButton,
  isReadOnly,
  isSubmitting,
  onCancel,
  panes,
  subtitle,
  title
}: Props): JSX.Element => {
  // Create indicator of if cancel button was clicked so that child components can know
  const [isBeingCanceled, updateBeingCanceled] = useState(false)
  const [buttonClicked, setButtonClicked] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setButtonClicked('')
  }, [panes])

  return (
    <>
      <StackedPanes
        canceling={isBeingCanceled}
        panes={panes}
        setIsLoading={setIsLoading}
        subtitle={subtitle}
        title={title}
      />

      {/* Announces when page is loading or submitting to AT users */}
      <InvisibleA11yLabel aria-live="polite" role="status">
        {isSubmitting && <FormattedMessage id="common.forms.loading" />}
      </InvisibleA11yLabel>

      <FormNavigationButtons
        backButton={{
          disabled: isSubmitting,
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
        extraButton={isReadOnly ? undefined : extraButton}
        okayButton={
          isReadOnly
            ? undefined
            : {
                disabled: isLoading || isSubmitting,
                text:
                  isLoading || isSubmitting ? (
                    <InlineLoading />
                  ) : (
                    <FormattedMessage id="components.StackedPaneDisplay.savePreferences" />
                  ),
                type: 'submit'
              }
        }
      />
    </>
  )
}
export default StackedPanesWithSave
