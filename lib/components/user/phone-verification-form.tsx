// @ts-expect-error Package yup does not have type declarations.
import * as yup from 'yup'
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock
} from 'react-bootstrap'
import { Field, Form, Formik, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import { getErrorStates } from '../../util/ui'
import { InlineLoading } from '../narrative/loading'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

import { ControlStrip, phoneFieldStyle } from './styled'
import { PhoneChangeSubmitHandler } from './phone-change-form'

const InlineTextInput = styled(FormControl)`
  ${phoneFieldStyle}
`

const FlushLink = styled(Button)`
  padding-left: 0;
  padding-right: 0;
`

// Validation schema for the phone validation code.
const codeValidationSchema = yup.object({
  validationCode: yup
    .string()
    .required()
    .matches(/^\d{6}$/) // 6-digit string
})

interface Fields {
  validationCode: string
}

export type PhoneVerificationSubmitHandler = (values: Fields) => void

interface Props {
  onRequestCode: PhoneChangeSubmitHandler
  onSubmit: PhoneVerificationSubmitHandler
}

type InnerProps = Props & FormikProps<Fields>

/**
 * Sub-form for entering and submitting a phone validation code.
 */
const PhoneVerificationInnerForm = (props: InnerProps): JSX.Element => {
  const {
    // Except for onRequest code, these props are provided by Formik.
    errors,
    isSubmitting,
    isValid,
    isValidating,
    onRequestCode,
    resetForm,
    submitCount,
    touched
  } = props
  const wrongCodeSubmitted =
    !isSubmitting && submitCount && isValid && !isValidating

  // Return focus to the input control if the incorrect code was submitted.
  useEffect(() => {
    if (wrongCodeSubmitted) {
      // Wait very briefly for UI to settle after user acknowledges wrong code.
      setTimeout(() => {
        resetForm()
        // Using the input id is more reliable than refs.
        document.getElementById('validation-code')?.focus()
      }, 200)
    }
  }, [wrongCodeSubmitted, resetForm])

  const codeErrorState = getErrorStates(props).validationCode
  const isInvalid = !!(touched.validationCode && errors.validationCode)
  const formId = 'phone-verification-form'

  return (
    <FormGroup validationState={codeErrorState}>
      {/* Set up an empty Formik Form without inputs, and link inputs using the form id.
          (A submit button within will incorrectly submit the entire page instead of just the subform.)
          The containing Formik element will watch submission of the form. */}
      <Form id={formId} noValidate />
      <p>
        <FormattedMessage id="components.PhoneNumberEditor.verificationInstructions" />
      </p>
      <ControlLabel htmlFor="validation-code">
        <FormattedMessage id="components.PhoneNumberEditor.verificationCode" />
      </ControlLabel>
      <ControlStrip>
        <Field
          aria-invalid={isInvalid}
          aria-required
          as={InlineTextInput}
          form={formId}
          id="validation-code"
          maxLength={6}
          name="validationCode"
          placeholder="123456"
          // HACK: <input type='tel'> triggers the numerical keypad on mobile devices, and otherwise
          // behaves like <input type='text'> with support of leading zeros and the maxLength prop.
          // <input type='number'> causes values to be stored as Number, resulting in
          // leading zeros to be invalid and stripped upon submission.
          type="tel"
        />
        <Button
          bsStyle="primary"
          disabled={isSubmitting}
          form={formId}
          type="submit"
        >
          {isSubmitting ? (
            <InlineLoading />
          ) : (
            <FormattedMessage id="components.PhoneNumberEditor.verify" />
          )}
          <InvisibleA11yLabel role="status">
            {isSubmitting && <FormattedMessage id="common.forms.submitting" />}
          </InvisibleA11yLabel>
        </Button>
        <HelpBlock role="alert">
          {isInvalid && (
            <FormattedMessage id="components.PhoneNumberEditor.invalidCode" />
          )}
        </HelpBlock>
      </ControlStrip>
      <FlushLink bsStyle="link" onClick={onRequestCode}>
        <FormattedMessage id="components.PhoneNumberEditor.requestNewCode" />
      </FlushLink>
    </FormGroup>
  )
}

/**
 * Sub-form for entering and submitting a phone validation code.
 */
const PhoneVerificationForm = (props: Props): JSX.Element => (
  <Formik
    initialValues={{ validationCode: '' }}
    onSubmit={props.onSubmit}
    validateOnBlur
    validateOnChange={false}
    validationSchema={codeValidationSchema}
  >
    {
      // Pass Formik props to the component rendered so Formik can manage this form's validation
      // independently from UserAccountScreen.
      (formikProps) => (
        <PhoneVerificationInnerForm {...formikProps} {...props} />
      )
    }
  </Formik>
)

export default PhoneVerificationForm
