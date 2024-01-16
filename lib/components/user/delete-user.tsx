import { Auth0ContextInterface, useAuth0 } from '@auth0/auth0-react'
import { Button, Sizes } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import React, { MouseEvent, useCallback } from 'react'
import styled from 'styled-components'

import * as userActions from '../../actions/user'
import { RED_ON_WHITE } from '../util/colors'

interface Props {
  block?: boolean
  deleteUser: (auth0: Auth0ContextInterface, intl: IntlShape) => void
  size?: Sizes
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
const DeleteUser = ({ block, deleteUser, size }: Props): JSX.Element => {
  const auth0 = useAuth0()
  const intl = useIntl()

  const handleDelete = useCallback(
    (evt: MouseEvent<Button>) => {
      // Avoid triggering onsubmit with formik (which would result in a save user call).
      evt.preventDefault()
      if (
        window.confirm(
          intl.formatMessage({
            id: 'components.UserAccountScreen.confirmDelete'
          })
        )
      ) {
        deleteUser(auth0, intl)
      }
    },
    [auth0, deleteUser, intl]
  )

  return (
    <DeleteButton block={block} bsSize={size} onClick={handleDelete}>
      <FormattedMessage id="components.DeleteUser.deleteMyAccount" />
    </DeleteButton>
  )
}

const mapDispatchToProps = {
  deleteUser: userActions.deleteUser
}

export default connect(null, mapDispatchToProps)(DeleteUser)
