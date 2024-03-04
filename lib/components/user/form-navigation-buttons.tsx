import { Button, FormGroup } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import React, { MouseEventHandler, ReactElement, ReactNode } from 'react'
import styled from 'styled-components'

// Styles
const StyledFormGroup = styled(FormGroup)`
  padding: 20px 0px;
  margin-bottom: 100px;
`
const LeftButton = styled(Button)`
  float: left;
`
const RightButton = styled(Button)`
  float: right;
`

export interface ButtonType {
  /** The JSX element to display as the button. */
  content?: ReactNode
  /** Whether the button is disabled. */
  disabled?: boolean
  /** Triggered when the button is clicked. */
  onClick?: MouseEventHandler<Button>
  /** The text to display on the button (JSX elements accepted). */
  text?: ReactElement
  /** The HTML type of the button. */
  type?: 'button' | 'reset' | 'submit' | undefined
}

interface Props {
  /** Information about the back button. */
  backButton?: ButtonType | false
  /** Extra button placed next to the okayButton */
  extraButton?: ButtonType
  /** Information about the okay (action) button. */
  okayButton?: ButtonType
}

/**
 * The button bar at the bottom of the account screen.
 */
const FormNavigationButtons = ({
  backButton,
  extraButton,
  okayButton
}: Props): JSX.Element => {
  const intl = useIntl()
  return (
    <StyledFormGroup>
      <nav
        aria-label={intl.formatMessage({
          id: 'components.FormNavigationButtons.ariaLabel'
        })}
      >
        {backButton &&
          (backButton.content || (
            <LeftButton
              disabled={backButton.disabled}
              onClick={backButton.onClick}
              type="button"
            >
              {backButton.text}
            </LeftButton>
          ))}
        {okayButton && (
          <RightButton
            bsStyle="primary"
            disabled={okayButton.disabled}
            onClick={okayButton.onClick}
            type={okayButton.type || 'button'}
          >
            {okayButton.text}
          </RightButton>
        )}
        {extraButton?.content}
      </nav>
    </StyledFormGroup>
  )
}

export default FormNavigationButtons
