import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import React, { HTMLAttributes } from 'react'

import { InlineLoading } from '../narrative/loading'

import InvisibleA11yLabel from './invisible-a11y-label'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  as?: string | ComponentType
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
    {...buttonProps}
    bsStyle="primary"
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
