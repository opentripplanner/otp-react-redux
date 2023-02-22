// @ts-expect-error Package yup does not have type declarations.
import * as yup from 'yup'
import { Button, ControlLabel, FormGroup, HelpBlock } from 'react-bootstrap'
import { Form, Formik, FormikProps } from 'formik'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  isPossiblePhoneNumber
  // @ts-expect-error Package does not have type declaration
} from 'react-phone-number-input'
// @ts-expect-error Package does not have type declaration
import Input from 'react-phone-number-input/input'
import React, { useCallback } from 'react'
import styled from 'styled-components'

import { ControlStrip, phoneFieldStyle } from './styled'

// Styles
const InlinePhoneInput = styled(Input)`
  ${phoneFieldStyle}
`

// The validation schema fo phone numbers - relies on the react-phone-number-input library.
const phoneValidationSchema = yup.object({
  phoneNumber: yup
    .string()
    .required()
    .test(
      'phone-number-format',
      'invalidPhoneNumber', // not directly shown.
      (value) => value && isPossiblePhoneNumber(value)
    )
})

interface Fields {
  phoneNumber: string
}

interface Props {
  onCancel: () => void
  onSubmit: (code: string) => void
  phoneFormatOptions: {
    countryCode: string
  }
  showCancel?: boolean
}

type InnerProps = FormikProps<Fields> & Props

const InnerPhoneChangeForm = ({
  errors, // Formik
  handleBlur, // Formik
  handleChange, // Formik
  onCancel,
  phoneFormatOptions,
  showCancel,
  touched, // Formik
  values // Formik
}: InnerProps) => {
  const intl = useIntl()
  const formId = 'phone-change-form'
  const showPhoneError = errors.phoneNumber && touched.phoneNumber

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && typeof onCancel === 'function') {
      // Cancel editing when user presses ESC from the phone number field.
      onCancel()
      e.preventDefault()
    }
  }

  const handlePhoneChange = useCallback(
    (newNumber) =>
      handleChange({
        target: {
          name: 'phoneNumber',
          value: newNumber
        }
      }),
    [handleChange]
  )

  return (
    <FormGroup
      onKeyDown={handleEscapeKey}
      validationState={showPhoneError && 'error'}
    >
      {/* Set up an empty Formik Form without inputs, and link inputs using the form id.
          (A submit button within will incorrectly submit the entire page instead of just the subform.)
          The containing Formik element will watch submission of the form. */}
      <Form id={formId} noValidate />
      <ControlLabel htmlFor="phone-number">
        <FormattedMessage id="components.PhoneNumberEditor.prompt" />
      </ControlLabel>
      <ControlStrip>
        <InlinePhoneInput
          aria-invalid={showPhoneError}
          aria-required
          className="form-control"
          country={phoneFormatOptions.countryCode}
          form={formId}
          id="phone-number"
          name="phoneNumber"
          onBlur={handleBlur}
          onChange={handlePhoneChange}
          placeholder={intl.formatMessage({
            id: 'components.PhoneNumberEditor.placeholder'
          })}
          type="tel"
          value={values.phoneNumber}
        />
        <Button bsStyle="primary" form={formId} type="submit">
          <FormattedMessage id="components.PhoneNumberEditor.sendVerificationText" />
        </Button>
        {
          // Show cancel button only if a phone number is already recorded.
          // TODO: apply this to ESC key too.
          showCancel && (
            <Button onClick={onCancel}>
              <FormattedMessage id="common.forms.cancel" />
            </Button>
          )
        }
        <HelpBlock role="alert">
          {showPhoneError && (
            <FormattedMessage id="components.PhoneNumberEditor.invalidPhone" />
          )}
        </HelpBlock>
      </ControlStrip>
    </FormGroup>
  )
}

/**
 * Sub-component that handles phone number and validation code editing and validation intricacies.
 */
const PhoneChangeForm = (props: Props): JSX.Element => {
  const { onSubmit } = props

  // Here are the states we are dealing with:
  // - First time entering a phone number/validation code (blank value, not modified)
  //   => no color, no feedback indication.
  // - Typing backspace all the way to erase a number/code (blank value, modified)
  //   => red error.
  // - Typing a phone number that doesn't match the configured phoneNumberRegEx
  //   => red error.

  return (
    <Formik
      initialValues={{ phoneNumber: '' }}
      onSubmit={onSubmit}
      validateOnBlur
      validateOnChange={false}
      validationSchema={phoneValidationSchema}
    >
      {(formikProps) => <InnerPhoneChangeForm {...formikProps} {...props} />}
    </Formik>
  )
}

export default PhoneChangeForm
