import { Alert } from 'react-bootstrap'
import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { IconWithText } from '../util/styledIcon'

const StyledAlert = styled(Alert)`
  margin-top: 25px;
`

/**
 * Displays a not-found alert if some content is not found.
 */
const NotFound = () => (
  <StyledAlert bsStyle="warning">
    <h1>
      <IconWithText Icon={ExclamationTriangle}>
        <FormattedMessage id="components.NotFound.header" />
      </IconWithText>
    </h1>
    <p>
      <FormattedMessage id="components.NotFound.description" />
    </p>
  </StyledAlert>
)

export default NotFound
