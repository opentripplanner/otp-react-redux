import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import React, { ButtonHTMLAttributes, ComponentType } from 'react'

import { InlineLoading } from '../narrative/loading'

import InvisibleA11yLabel from './invisible-a11y-label'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button' | ComponentType
  isSubmitting?: boolean
}

/**
 * Submit button with 'submitting' state and relevant a11y.
 */
const SubmitButton = ({
  as: Component = Button,
  children,
  isSubmitting,
  ...buttonProps
}: Props): JSX.Element => (
  <Component
    // @ts-expect-error bsStyle 'primary' sets the button color to blue and can be overwritten in props.
    bsStyle="primary"
    {...buttonProps}
    disabled={isSubmitting}
    type="submit"
  >
    {isSubmitting ? <InlineLoading /> : children}
    <InvisibleA11yLabel role="status">
      {isSubmitting && <FormattedMessage id="common.forms.submitting" />}
    </InvisibleA11yLabel>
  </Component>
)

export default SubmitButton
