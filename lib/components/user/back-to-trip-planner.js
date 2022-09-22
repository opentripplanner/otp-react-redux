import { ArrowLeft } from '@styled-icons/fa-solid'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { IconWithText } from '../util/styledIcon'
import { LinkWithQuery } from '../form/connected-links'

const StyledLinkWithQuery = styled(LinkWithQuery)`
  display: block;
`

const BackToTripPlanner = () => (
  <StyledLinkWithQuery to="/">
    <IconWithText Icon={ArrowLeft}>
      <FormattedMessage id="components.BackToTripPlanner.backToTripPlanner" />
    </IconWithText>
  </StyledLinkWithQuery>
)

export default BackToTripPlanner
