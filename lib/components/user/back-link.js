import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { navigateBack } from '../../util/ui'
import StyledIconWrapper from '../util/styledIcon'

const StyledButton = styled(Button)`
  display: block;
  padding: 0;
`

/**
 * Back link that navigates to the previous location in browser history.
 */
const BackLink = () => (
  <StyledButton bsStyle="link" onClick={navigateBack}>
    <StyledIconWrapper spaceRight>
      <ArrowLeft style={{ marginRight: '.5em' }} />
    </StyledIconWrapper>
    <FormattedMessage id="common.forms.back" />
  </StyledButton>
)

export default BackLink
