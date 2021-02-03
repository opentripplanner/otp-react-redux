import React from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

import Icon from '../narrative/icon'

const StyledButton = styled(Button)`
  padding: 0;
`

const navigateBack = () => window.history.back()

/**
 * Back link that navigates to the previous location in browser history.
 */
const BackLink = () => (
  <StyledButton
    bsStyle='link'
    onClick={navigateBack}
  >
    <Icon name='arrow-left' />  Back
  </StyledButton>
)

export default BackLink
