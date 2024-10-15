import { ControlLabel, FormGroup } from 'react-bootstrap'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
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
  intl: IntlShape
  onDelete: (email: string) => void
}

const CompanionRow = ({
  companionInfo,
  intl,
  onDelete
}: CompanionRowProps): JSX.Element => {
  const { email, status } = companionInfo
  const [disabled, setDisabled] = useState(false)

  const handleDelete = useCallback(async () => {
    if (
      window.confirm(
        intl.formatMessage(
          { id: 'components.CompanionsPane.confirmDeleteCompanion' },
          { email: email }
        )
      )
    ) {
      setDisabled(true)
      await onDelete(email)
      setDisabled(false)
    }
  }, [email, intl, onDelete])

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
          title={intl.formatMessage(
            { id: 'components.CompanionsPane.deleteCompanion' },
            { email: email }
          )}
        >
          <StyledIconWrapper>
            <Trash />
          </StyledIconWrapper>
          <InvisibleA11yLabel>
            <FormattedMessage
              id="components.CompanionsPane.deleteCompanion"
              values={{ email }}
            />
          </InvisibleA11yLabel>
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
  const intl = useIntl()

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
        alert(
          intl.formatMessage(
            { id: 'components.CompanionsPane.companionAlreadyAdded' },
            { email: newEmail }
          )
        )
      }
    },
    [companions, intl, updateCompanions]
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
        <FormattedMessage id="components.CompanionsPane.companionExplanation" />
      </p>
      <FormGroup>
        <ControlLabel>
          <FormattedMessage id="components.CompanionsPane.currentCompanionsLabel" />
        </ControlLabel>

        {companions.length === 0 ? (
          <p>
            <FormattedMessage id="components.CompanionsPane.noCompanions" />
          </p>
        ) : (
          <CompanionList>
            {companions.map((companion) => (
              <CompanionRow
                companionInfo={companion}
                intl={intl}
                key={companion.email}
                onDelete={handleDeleteEmail}
              />
            ))}
          </CompanionList>
        )}
      </FormGroup>
      <AddEmailForm
        id={formId}
        label={
          <FormattedMessage id="components.CompanionsPane.addNewCompanion" />
        }
        onSubmit={handleAddNewEmail}
        placeholder="friend.email@example.com"
        submitText={
          <FormattedMessage id="components.CompanionsPane.submitNewCompanion" />
        }
      />
    </div>
  )
}

export default CompanionsPane
