import React, { ComponentType, HTMLAttributes } from 'react'
import styled from 'styled-components'

import { StyledIconWrapperTextAlign } from '../util/styledIcon'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

interface Props extends HTMLAttributes<HTMLDivElement> {
  Icon: ComponentType
  status: string // "Scheduled", "2 min late based on real-time data", "Canceled"
}

const IconWrapper = styled(StyledIconWrapperTextAlign)`
  font-size: 0.6em;
  margin: 0;
  margin-right: 2px;
`

/**
 * Renders a stop time with a status icon and status update.
 */
const StopTimeCellBase = ({
  children,
  className,
  Icon,
  status
}: Props): JSX.Element => (
  <div className={`percy-hide ${className}`} title={status}>
    <IconWrapper>
      <Icon />
    </IconWrapper>

    <span className="percy-hide">
      {children}
      <InvisibleA11yLabel>, {status}</InvisibleA11yLabel>
    </span>
  </div>
)

export default StopTimeCellBase
