import React from 'react'
import { Alert } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'

import Icon from '../util/icon'

const StyledAlert = styled(Alert)`
  margin-top: 25px;
`

/**
 * Displays a not-found alert if some content is not found.
 */
const NotFound = () => (
  <StyledAlert bsStyle='warning'>
    <h1>
      <Icon type='exclamation-triangle' withSpace />
      <FormattedMessage id='components.NotFound.header' />
    </h1>
    <p>
      <FormattedMessage id='components.NotFound.description' />
    </p>
  </StyledAlert>
)

export default NotFound
