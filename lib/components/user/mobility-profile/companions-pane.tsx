import { Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap'
import { FormikProps } from 'formik'
import React, { useCallback } from 'react'

import { User } from '../types'
import AddEmailForm from '../common/add-email-form'

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

  const handleAddNewEmail = useCallback(
    async (args) => {
      setFieldValue('guardians', [
        ...companions,
        {
          email: args.newEmail,
          status: 'PENDING',
          userId: ''
        }
      ])

      await handleChange({
        target: document.getElementById(formId)
      })
    },
    [companions, handleChange, setFieldValue]
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
              <li key={comp.email}>
                {comp.email} - {comp.status} - [delete]
              </li>
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
