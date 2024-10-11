import { ControlLabel, FormGroup } from 'react-bootstrap'
import { FormikProps } from 'formik'
import { Trash } from '@styled-icons/fa-solid/Trash'
import { User as UserIcon } from '@styled-icons/fa-solid/User'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { CompanionInfo, User } from '../types'
import { StyledIconWrapper } from '../../util/styledIcon'
import { UnstyledButton } from '../../util/unstyled-button'
import AddEmailForm from '../common/add-email-form'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import StatusBadge from '../../util/status-badge'
import SubmitButton from '../../util/submit-button'

const Companion = styled.li`
  list-style-type: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
`

const CompanionList = styled.ul`
  margin-bottom: 30px;
`

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`

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
    <Companion>
      <LeftGroup>
        <StyledIconWrapper>
          <UserIcon />
        </StyledIconWrapper>
        {email}
      </LeftGroup>
      <RightGroup>
        <StatusBadge status={status} />
        <SubmitButton
          as={UnstyledButton}
          disabled={disabled}
          onClick={handleDelete}
          title={`Delete ${email}`}
        >
          <StyledIconWrapper>
            <Trash />
          </StyledIconWrapper>
          <InvisibleA11yLabel>Delete {email}</InvisibleA11yLabel>
        </SubmitButton>
      </RightGroup>
    </Companion>
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
        email. When they accept, their status will change to "verified", and you
        can share your trip status and plan trips based on one another's
        mobility profile.
      </p>
      <FormGroup>
        <ControlLabel>Current travel companions:</ControlLabel>

        {companions.length === 0 ? (
          <p>You do not have any existing travel companions for this trip.</p>
        ) : (
          <CompanionList>
            {companions.map((companion) => (
              <CompanionRow
                companionInfo={companion}
                key={companion.email}
                onDelete={handleDeleteEmail}
              />
            ))}
          </CompanionList>
        )}
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
