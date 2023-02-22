// @ts-expect-error Package yup does not have type declarations.
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

import { getErrorStates } from '../../util/ui'

import { ControlStrip, phoneFieldStyle } from './styled'
import { PhoneChangeSubmitHandler } from './phone-change-form'

const InlineTextInput = styled(FormControl)`
  ${phoneFieldStyle}
`

const FlushLink = styled(Button)`
  padding-left: 0;
  padding-right: 0;
`

// Because we show the same message for the two validation conditions below,
// there is no need to pass that message here,
// that is done in the corresponding `<HelpBlock>` in PhoneNumberEditor.
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

/**
 * Sub-form for entering and submitting a phone validation code.
 */
const PhoneVerificationForm = ({
  onRequestCode,
  onSubmit
}: Props): JSX.Element => (
  <Formik
    initialValues={{ validationCode: '' }}
    onSubmit={onSubmit}
    validateOnBlur
    validateOnChange={false}
    validationSchema={codeValidationSchema}
  >
    {
      // Pass Formik props to the component rendered so Formik can manage its validation.
      // (The validation for this component is independent of the validation set in UserAccountScreen.)
      (formikProps) => {
        // Formik props
        const { errors, touched } = formikProps
        const codeErrorState = getErrorStates(formikProps).validationCode
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
              <Button bsStyle="primary" form={formId} type="submit">
                <FormattedMessage id="components.PhoneNumberEditor.verify" />
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
    }
  </Formik>
)

export default PhoneVerificationForm
