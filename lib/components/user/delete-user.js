import React from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'

const DeleteButton = styled(Button)`
  background-color: white;
  color: #d9534f;
  :hover, :focus, :active, :focus:active {
    background-color: #f7f7f7;
    color: #d9534f;
  }
`

/**
 * Renders a delete user button for the account settings page.
 */
const DeleteUser = ({onDelete}) => (
  <DeleteButton block bsSize='large' bsStyle='danger' onClick={onDelete}>
    Delete my account
  </DeleteButton>
)

export default DeleteUser
