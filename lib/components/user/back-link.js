import React from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

import { navigateBack } from '../../util/ui'

import { IconWithMargin } from './styled'

const StyledButton = styled(Button)`
  display: block;
  padding: 0;
`

/**
 * Back link that navigates to the previous location in browser history.
 */
const BackLink = () => (
  <StyledButton
    bsStyle='link'
    onClick={navigateBack}
  >
    <IconWithMargin name='arrow-left' />
    Back
  </StyledButton>
)

export default BackLink
