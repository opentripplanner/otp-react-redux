import { FormattedMessage } from 'react-intl'
import React, { useState } from 'react'

import { InlineLoading } from '../narrative/loading'

import { PageHeading, StackedPaneContainer } from './styled'
import FormNavigationButtons from './form-navigation-buttons'

type Props = {
  onCancel: () => void
  paneSequence: any[]
  title?: string | JSX.Element
}

/**
 * This component handles the flow between screens for new OTP user accounts.
 *
 * TODO: add types once Pane type exists
 */
const StackedPaneDisplay = ({
  onCancel,
  paneSequence,
  title
}: Props): JSX.Element => {
  // Create indicator of if cancel button was clicked so that child components can know
  const [isBeingCanceled, updateBeingCanceled] = useState(false)
  const [buttonClicked, setButtonClicked] = useState('')

  return (
    <>
      {title && <PageHeading>{title}</PageHeading>}
      {paneSequence.map(
        ({ hidden, pane: Pane, props, title }, index) =>
          !hidden && (
            <StackedPaneContainer key={index}>
              <h3>{title}</h3>
              <div>
                <Pane canceled={isBeingCanceled} {...props} />
              </div>
            </StackedPaneContainer>
          )
      )}

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
export default StackedPaneDisplay
