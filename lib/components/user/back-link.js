import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { IconWithText } from '../util/styledIcon'
import { navigateBack } from '../../util/ui'

const StyledButton = styled(Button)`
  display: block;
  padding: 0;
`

export const backButtonContent = (
  <IconWithText Icon={ArrowLeft}>
    <FormattedMessage id="common.forms.back" />
  </IconWithText>
)

/**
 * Back link that navigates to the previous location in browser history.
 */
const BackLink = () => (
  <StyledButton bsStyle="link" onClick={navigateBack}>
    {backButtonContent}
  </StyledButton>
)

export default BackLink
