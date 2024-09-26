import * as yup from 'yup'
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock
} from 'react-bootstrap'
import { Field, Form, Formik } from 'formik'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { ControlStrip, phoneFieldStyle } from '../styled'
import { InlineLoading } from '../../narrative/loading'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

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
  width: 20em;
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
            <ControlStrip>
              {/* TODO: Make ControlStrip a flex element, add v-gap when multi-line. */}
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

              {/* TODO: Refactor submit button. */}
              <Button
                bsStyle="primary"
                disabled={isSubmitting}
                form={id}
                type="submit"
              >
                {isSubmitting ? <InlineLoading /> : submitText}
                <InvisibleA11yLabel role="status">
                  {isSubmitting && (
                    <FormattedMessage id="common.forms.submitting" />
                  )}
                </InvisibleA11yLabel>
              </Button>
            </ControlStrip>
            <HelpBlock role="alert">{showError && 'Invalid email'}</HelpBlock>
          </FormGroup>
        )
      }}
    </Formik>
  )
}

export default AddEmailForm
