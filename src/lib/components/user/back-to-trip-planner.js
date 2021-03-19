import React from 'react'
import styled from 'styled-components'

import { LinkWithQuery } from '../form/connected-links'
import { IconWithMargin } from './styled'

const StyledLinkWithQuery = styled(LinkWithQuery)`
  display: block;
`

const BackToTripPlanner = () => (
  <StyledLinkWithQuery to={'/'}>
    <IconWithMargin name='arrow-left' />
    Back to trip planner
  </StyledLinkWithQuery>
)

export default BackToTripPlanner
