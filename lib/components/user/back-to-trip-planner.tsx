import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { IconWithText } from '../util/styledIcon'
import Link from '../util/link'

const StyledLink = styled(Link)`
  display: block;
`

const BackToTripPlanner = (): JSX.Element => (
  <StyledLink to="/">
    <IconWithText Icon={ArrowLeft}>
      <FormattedMessage id="components.BackToTripPlanner.backToTripPlanner" />
    </IconWithText>
  </StyledLink>
)

export default BackToTripPlanner
