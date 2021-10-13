import React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'

import { LinkWithQuery } from '../form/connected-links'

import { IconWithMargin } from './styled'

const StyledLinkWithQuery = styled(LinkWithQuery)`
  display: block;
`

const BackToTripPlanner = () => (
  <StyledLinkWithQuery to={'/'}>
    <IconWithMargin type='arrow-left' />
    <FormattedMessage id='components.BackToTripPlanner.backToTripPlanner' />
  </StyledLinkWithQuery>
)

export default BackToTripPlanner
