import { Label as BsLabel, ControlLabel, FormGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { FormikProps } from 'formik'
import { Trash } from '@styled-icons/fa-solid/Trash'
import React, { useCallback, useState } from 'react'

import { StyledIconWrapper } from '../../util/styledIcon'
import { UnstyledButton } from '../../util/unstyled-button'
import { User } from '../types'
import AddEmailForm from '../common/add-email-form'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

interface CompanionInfo {
  email: string
  status?: string
}

interface CompanionRowProps {
  companionInfo: CompanionInfo
  onDelete: (email: string) => void
}

const CompanionRow = ({
  companionInfo,
  onDelete
}: CompanionRowProps): JSX.Element => {
  const { email, status } = companionInfo
  const [disabled, setDisabled] = useState(false)

  const handleDelete = useCallback(async () => {
    if (window.confirm(`Do you want to delete companion ${email}?`)) {
      setDisabled(true)
      await onDelete(email)
      setDisabled(false)
    }
  }, [email, onDelete])

  return (
    <li>
      {email}{' '}
      {status === 'PENDING' ? (
        <BsLabel bsStyle="warning">
          <FormattedMessage id="components.PhoneNumberEditor.pending" />
        </BsLabel>
      ) : status === 'VERIFIED' ? (
        <BsLabel style={{ background: 'green' }}>
          <FormattedMessage id="components.PhoneNumberEditor.verified" />
        </BsLabel>
      ) : (
        <BsLabel>Invalid</BsLabel>
      )}{' '}
      <UnstyledButton
        disabled={disabled}
        onClick={handleDelete}
        title={`Delete ${email}`}
      >
        <StyledIconWrapper>
          <Trash />
        </StyledIconWrapper>
        <InvisibleA11yLabel>Delete {email}</InvisibleA11yLabel>
      </UnstyledButton>
    </li>
  )
}

/**
 * Companions pane, part of mobility profile.
 */
const CompanionsPane = ({
  handleChange,
  setFieldValue,
  values: userData
}: FormikProps<User>): JSX.Element => {
  const { guardians: companions = [] } = userData
  const formId = 'add-companion-form'

  const updateCompanions = useCallback(
    async (newCompanions) => {
      setFieldValue('guardians', newCompanions)

      // Register the change (can include a submission).
      await handleChange({
        target: document.getElementById(formId)
      })
    },
    [handleChange, setFieldValue]
  )

  const handleAddNewEmail = useCallback(
    async ({ newEmail }, { resetForm }) => {
      // Submit the new email if it is not already listed
      if (!companions.find((comp) => comp.email === newEmail)) {
        await updateCompanions([
          ...companions,
          {
            email: newEmail,
            status: 'PENDING',
            userId: ''
          }
        ])
        resetForm()
      } else {
        alert(`You already have a companion with email ${newEmail}.`)
      }
    },
    [companions, updateCompanions]
  )

  const handleDeleteEmail = useCallback(
    async (email: string) => {
      await updateCompanions(companions.filter((comp) => comp.email !== email))
    },
    [companions, updateCompanions]
  )

  return (
    <div>
      <p>
        Invite an exiting GMAP user to be a travel companion by entering their
        email. When they accept, their status will change to "Verified", and you
        can share your trip status and plan trips based on one another's
        mobility profile.
      </p>
      <FormGroup>
        <ControlLabel>Current travel companions</ControlLabel>
        <ul>
          {companions.length === 0 ? (
            <li>No companions</li>
          ) : (
            companions.map((comp) => (
              <CompanionRow
                companionInfo={comp}
                key={comp.email}
                onDelete={handleDeleteEmail}
              />
            ))
          )}
        </ul>
      </FormGroup>
      <AddEmailForm
        id={formId}
        label="Add a travel companion"
        onSubmit={handleAddNewEmail}
        placeholder="friend.email@example.com"
        submitText="Send invitation"
      />
    </div>
  )
}

export default CompanionsPane
