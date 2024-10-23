import { Label as BsLabel } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import InvisibleA11yLabel from '../util/invisible-a11y-label'

const StyledStatusLabel = styled(BsLabel)`
  padding: 0.2em 0.5em 0.2em !important;
`

interface Props {
  status?: string
}

function getStatusLabel(status?: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return (
        <StyledStatusLabel bsStyle="warning">
          <FormattedMessage id="components.StatusBadge.pending" />
        </StyledStatusLabel>
      )
    case 'verified':
      return (
        <StyledStatusLabel style={{ background: 'green' }}>
          <FormattedMessage id="components.StatusBadge.verified" />
        </StyledStatusLabel>
      )
    case 'invalid':
      return (
        <StyledStatusLabel>
          <FormattedMessage id="components.StatusBadge.invalid" />
        </StyledStatusLabel>
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
