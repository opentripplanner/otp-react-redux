// @ts-expect-error No TypeScript for yup.
import * as yup from 'yup'
import {
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock
} from 'react-bootstrap'
import { Field, Form, Formik } from 'formik'
import React, { ReactNode } from 'react'
import styled from 'styled-components'

import { ControlStrip, phoneFieldStyle } from '../styled'
import SubmitButton from '../../util/submit-button'

interface Props {
  id: string
  label: ReactNode
  onSubmit: any
  placeholder?: string
  submitText: ReactNode
}

// Styles
const InlineInput = styled(FormControl)`
  ${phoneFieldStyle}
  width: 100%;
`

const Controls = styled.span`
  display: flex;

  input {
    margin-right: 10px;
  }
`

// The validation schema for email addresses
const emailValidationSchema = yup.object({
  newEmail: yup.string().email().required()
})

/**
 * Just a form to add an email.
 */
const AddEmailForm = ({
  id,
  label,
  onSubmit,
  placeholder,
  submitText
}: Props): JSX.Element => {
  return (
    <Formik
      initialValues={{ newEmail: '' }}
      onSubmit={onSubmit}
      validateOnBlur
      validateOnChange={false}
      validationSchema={emailValidationSchema}
    >
      {({ errors, isSubmitting, touched, values }) => {
        const showError =
          errors.newEmail && touched.newEmail && values.newEmail?.length > 0
        return (
          <FormGroup validationState={showError ? 'error' : null}>
            <ControlLabel>{label}</ControlLabel>
            <Controls>
              <Form id={id} noValidate />
              <Field
                aria-invalid={showError}
                aria-required
                as={InlineInput}
                form={id}
                name="newEmail"
                placeholder={placeholder}
                type="email"
              />

              <SubmitButton form={id}>{submitText}</SubmitButton>
            </Controls>
            <HelpBlock role="alert">{showError && 'Invalid email'}</HelpBlock>
          </FormGroup>
        )
      }}
    </Formik>
  )
}

export default AddEmailForm
