import React from 'react'
import { Alert, Glyphicon } from 'react-bootstrap'
import styled from 'styled-components'

const StyledAlert = styled(Alert)`
  margin-top: 25px;
`

/**
 * Displays a not-found alert if some content is not found.
 */
const NotFound = () => (
  <StyledAlert bsStyle='warning'>
    <h1><Glyphicon glyph='alert' /> Content not found</h1>
    <p>The content you requested is not available.</p>
  </StyledAlert>
)

export default NotFound
