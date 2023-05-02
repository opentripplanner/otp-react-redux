import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { RED_ON_WHITE } from '../util/colors'

interface Props {
  onDelete: () => void
}

const DeleteButton = styled(Button)`
  background-color: white;
  border-color: ${RED_ON_WHITE};
  color: ${RED_ON_WHITE};
  :active,
  :focus,
  :focus:active,
  :hover {
    border-color: ${RED_ON_WHITE};
    color: ${RED_ON_WHITE};
  }
`

/**
 * Renders a delete user button for the account settings page.
 */
const DeleteUser = ({ onDelete }: Props): JSX.Element => (
  <DeleteButton block bsSize="large" onClick={onDelete}>
    <FormattedMessage id="components.DeleteUser.deleteMyAccount" />
  </DeleteButton>
)

export default DeleteUser
