import { Label as BsLabel } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import InvisibleA11yLabel from '../util/invisible-a11y-label'

interface Props {
  status?: string
}

function getStatusLabel(status?: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return (
        <BsLabel bsStyle="warning">
          <FormattedMessage id="components.StatusBadge.pending" />
        </BsLabel>
      )
    case 'verified':
      return (
        <BsLabel style={{ background: 'green' }}>
          <FormattedMessage id="components.StatusBadge.verified" />
        </BsLabel>
      )
    case 'invalid':
      return (
        <BsLabel>
          <FormattedMessage id="components.StatusBadge.invalid" />
        </BsLabel>
      )
    default:
      return null
  }
}

/** Renders a badge to convey status such as 'verified', 'pending'. */
const StatusBadge = ({ status }: Props): JSX.Element => {
  return (
    <>
      {/* Surround badge with invisible parentheses for no-CSS and screen readers */}
      <InvisibleA11yLabel> (</InvisibleA11yLabel>
      {getStatusLabel(status)}
      <InvisibleA11yLabel>) </InvisibleA11yLabel>
    </>
  )
}

export default StatusBadge
