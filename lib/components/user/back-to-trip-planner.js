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
    {/** FIXME: handle right-to-left languages */}
    <IconWithMargin name='arrow-left' />
    <FormattedMessage id='components.BackToTripPlanner.backToTripPlanner' />
  </StyledLinkWithQuery>
)

export default BackToTripPlanner
