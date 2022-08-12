import { ArrowLeft } from '@styled-icons/fa-solid'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { LinkWithQuery } from '../form/connected-links'
import StyledIconWrapper from '../util/styledIcon'

const StyledLinkWithQuery = styled(LinkWithQuery)`
  display: block;
`

const BackToTripPlanner = () => (
  <StyledLinkWithQuery to="/">
    <StyledIconWrapper>
      <ArrowLeft style={{ marginRight: '.5em' }} />
    </StyledIconWrapper>
    <FormattedMessage id="components.BackToTripPlanner.backToTripPlanner" />
  </StyledLinkWithQuery>
)

export default BackToTripPlanner
