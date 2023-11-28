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
import React, {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef
} from 'react'
import styled from 'styled-components'

import { InlineLoading } from '../narrative/loading'
import { PhoneFormatConfig } from '../../util/config-types'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

import { ControlStrip, phoneFieldStyle } from './styled'

// Styles
const InlinePhoneInput = styled(Input)`
  ${phoneFieldStyle}
`

// The validation schema for phone numbers - relies on the react-phone-number-input library.
// Supports the following cases:
// - First time entering a phone number/validation code (blank value, not modified)
//   => no color, no feedback indication.
// - Typing backspace all the way to erase a number/code (blank value, modified)
//   => invalid (red) alert.
// - Typing a phone number that doesn't match the configured phoneNumberRegEx
//   => invalid (red) alert.
const phoneValidationSchema = yup.object({
  phoneNumber: yup
    .string()
    .required()
    .test(
      'phone-number-format',
      'invalidPhoneNumber', // not directly shown.
      (value?: string) => value && isPossiblePhoneNumber(value)
    )
})

interface Fields {
  phoneNumber: string
}

export type PhoneChangeSubmitHandler = (
  values: Fields | MouseEvent<Button>
) => void

interface Props {
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: PhoneChangeSubmitHandler
  phoneFormatOptions: PhoneFormatConfig
  showCancel?: boolean
}

type InnerProps = FormikProps<Fields> & Props

const formId = 'phone-change-form'

const InnerPhoneChangeForm = ({
  errors, // Formik
  handleBlur, // Formik
  handleChange, // Formik
  isSubmitting,
  onCancel,
  phoneFormatOptions,
  showCancel,
  touched, // Formik
  values // Formik
}: InnerProps) => {
  const intl = useIntl()
  const ref = useRef<HTMLInputElement>()
  const showPhoneError = errors.phoneNumber && touched.phoneNumber

  useEffect(() => {
    if (showCancel) ref.current?.focus()
  }, [ref, showCancel])

  const handleEscapeKey = useCallback(
    (e: KeyboardEvent<FormGroup>) => {
      if (e.key === 'Escape' && showCancel && typeof onCancel === 'function') {
        e.preventDefault()
        // Cancel editing when user presses ESC from the phone number field.
        onCancel()
      }
    },
    [onCancel, showCancel]
  )

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
      // Handle ESC key from anywhere in this element.
      onKeyDown={handleEscapeKey}
      validationState={showPhoneError ? 'error' : null}
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
          ref={ref}
          type="tel"
          value={values.phoneNumber}
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
            <FormattedMessage id="components.PhoneNumberEditor.sendVerificationText" />
          )}
          <InvisibleA11yLabel role="status">
            {isSubmitting && <FormattedMessage id="common.forms.submitting" />}
          </InvisibleA11yLabel>
        </Button>
        {
          // Show cancel button only if a phone number is already recorded.
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
        <HelpBlock>
          <FormattedMessage id="components.PhoneNumberEditor.smsConsent" />
        </HelpBlock>
      </ControlStrip>
    </FormGroup>
  )
}

/**
 * Sub-component that handles phone number editing and validation.
 */
const PhoneChangeForm = (props: Props): JSX.Element => (
  <Formik
    initialValues={{ phoneNumber: '' }}
    onSubmit={props.onSubmit}
    validateOnBlur
    validateOnChange={false}
    validationSchema={phoneValidationSchema}
  >
    {(formikProps: FormikProps<Fields>) => (
      <InnerPhoneChangeForm {...formikProps} {...props} />
    )}
  </Formik>
)

export default PhoneChangeForm
