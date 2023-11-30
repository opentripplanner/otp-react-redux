import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { red } from '@opentripplanner/building-blocks'
import React from 'react'
import styled from 'styled-components'

interface Props {
  onDelete: () => void
}

const DeleteButton = styled(Button)`
  background-color: white;
  border-color: ${red[800]};
  color: ${red[800]};
  :active,
  :focus,
  :focus:active,
  :hover {
    border-color: ${red[800]};
    color: ${red[800]};
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
