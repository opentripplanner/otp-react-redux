import { Field, Formik } from 'formik'
import React, { Component } from 'react'
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
  Label,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import { FormattedMessage, injectIntl } from 'react-intl'
import { formatPhoneNumber, isPossiblePhoneNumber } from 'react-phone-number-input'
import Input from 'react-phone-number-input/input'
import styled, { css } from 'styled-components'
import * as yup from 'yup'

import { getErrorStates, isBlank } from '../../util/ui'

const allowedNotificationChannels = ['email', 'sms', 'none']

// Styles
// HACK: Preserve container height.
const Details = styled.div`
  min-height: 60px;
  margin-bottom: 15px;
`
const ControlStrip = styled.div`
  > * {
    margin-right: 4px;
  }
`
const phoneFieldCss = css`
  display: inline-block;
  vertical-align: middle;
  width: 14em;
`
const InlineTextInput = styled(FormControl)`
  ${phoneFieldCss}
`
const InlineStatic = styled(FormControl.Static)`
  ${phoneFieldCss}
`
const InlinePhoneInput = styled(Input)`
  ${phoneFieldCss}
`

const FlushLink = styled(Button)`
  padding-left: 0;
  padding-right: 0;
`

// Because we show the same message for the two validation conditions below,
// there is no need to pass that message here,
// that is done in the corresponding `<HelpBlock>` in PhoneNumberEditor.
const codeValidationSchema = yup.object({
  validationCode: yup.string()
    .required()
    .matches(/^\d{6}$/) // 6-digit string
})

/**
 * User notification preferences pane.
 */
const NotificationPrefsPane = ({
  handleBlur, // Formik prop
  handleChange, // Formik prop
  loggedInUser,
  onRequestPhoneVerificationCode,
  onSendPhoneVerificationCode,
  phoneFormatOptions,
  values: userData // Formik prop
}) => {
  const {
    email,
    isPhoneNumberVerified,
    phoneNumber
  } = loggedInUser

  const {
    notificationChannel
  } = userData

  const initialFormikValues = {
    validationCode: ''
  }

  return (
    <div>
      <p>
        <FormattedMessage id='components.NotificationPrefsPane.description' />
      </p>
      <FormGroup>
        <ControlLabel>
          <FormattedMessage id='components.NotificationPrefsPane.notificationChannelPrompt' />
        </ControlLabel>
        <ButtonToolbar>
          <ToggleButtonGroup
            defaultValue={notificationChannel}
            name='notificationChannel'
            type='radio'
          >
            {allowedNotificationChannels.map((type, index) => (
              // TODO: If removing the Save/Cancel buttons on the account screen,
              // persist changes immediately when onChange is triggered.
              <ToggleButton
                bsStyle={notificationChannel === type ? 'primary' : 'default'}
                key={index}
                // onBlur and onChange have to be set on individual controls instead of the control group
                // in order for Formik to correctly process the changes.
                onBlur={handleBlur}
                onChange={handleChange}
                value={type}
              >
                {type === 'email'
                  // TODO: Create util component?
                  ? <FormattedMessage id={`components.NotificationPrefsPane.emailSelect`} />
                  : type === 'sms'
                    ? <FormattedMessage id={`components.NotificationPrefsPane.smsSelect`} />
                    : <FormattedMessage id={`components.NotificationPrefsPane.noneSelect`} />
                }
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </ButtonToolbar>
      </FormGroup>
      <Details>
        {notificationChannel === 'email' && (
          <FormGroup>
            <ControlLabel>
              <FormattedMessage id='components.NotificationPrefsPane.notificationEmailDetail' />
            </ControlLabel>
            <FormControl.Static>{email}</FormControl.Static>
          </FormGroup>
        )}
        {notificationChannel === 'sms' && (
          <Formik
            initialValues={initialFormikValues}
            validateOnChange
            validationSchema={codeValidationSchema}
          >
            {
              // Pass Formik props to the component rendered so Formik can manage its validation.
              // (The validation for this component is independent of the validation set in UserAccountScreen.)
              innerProps => {
                return (
                  <PhoneNumberEditorWithIntl
                    {...innerProps}
                    initialPhoneNumber={phoneNumber}
                    initialPhoneNumberVerified={isPhoneNumberVerified}
                    onRequestCode={onRequestPhoneVerificationCode}
                    onSubmitCode={onSendPhoneVerificationCode}
                    phoneFormatOptions={phoneFormatOptions}
                  />
                )
              }
            }
          </Formik>
        )}
      </Details>
    </div>
  )
}

export default NotificationPrefsPane

/**
 * Sub-component that handles phone number and validation code editing and validation intricacies.
 */
class PhoneNumberEditor extends Component {
  constructor (props) {
    super(props)

    const { initialPhoneNumber } = props
    this.state = {
      // If true, phone number is being edited.
      // For new users, render component in editing state.
      isEditing: isBlank(initialPhoneNumber),

      // Holds the new phone number (+15555550123 format) entered by the user
      // (outside of Formik because (Phone)Input does not have a standard onChange event or simple valitity test).
      newPhoneNumber: ''
    }
  }

  _handleEditNumber = () => {
    this.setState({
      isEditing: true,
      newPhoneNumber: ''
    })
  }

  _handleNewPhoneNumberChange = newPhoneNumber => {
    this.setState({
      newPhoneNumber
    })
  }

  _handleCancelEditNumber = () => {
    this.setState({
      isEditing: false
    })
  }

  _handlePhoneNumberKeyDown = e => {
    if (e.keyCode === 13) {
      // On the user pressing enter (keyCode 13) on the phone number field,
      // prevent form submission and request the code.
      e.preventDefault()
      this._handleRequestCode()
    }
  }

  _handleValidationCodeKeyDown = e => {
    if (e.keyCode === 13) {
      // On the user pressing enter (keyCode 13) on the validation code field,
      // prevent form submission and send the validation code.
      e.preventDefault()
      this._handleSubmitCode()
    }
  }

  /**
   * Send phone verification request with the entered values.
   */
  _handleRequestCode = () => {
    const { initialPhoneNumber, initialPhoneNumberVerified, onRequestCode } = this.props
    const { newPhoneNumber } = this.state

    this._handleCancelEditNumber()

    // Send the SMS request if one of these conditions apply:
    // - the user entered a valid phone number different than their current verified number,
    // - the user clicks 'Request new code' for an already pending number
    //   (they could have refreshed the page in between).
    let submittedNumber

    if (newPhoneNumber &&
      isPossiblePhoneNumber(newPhoneNumber) &&
      !(newPhoneNumber === initialPhoneNumber && initialPhoneNumberVerified)) {
      submittedNumber = newPhoneNumber
    } else if (this._isPhoneNumberPending()) {
      submittedNumber = initialPhoneNumber
    }

    if (submittedNumber) {
      onRequestCode(submittedNumber)
    }
  }

  _handleSubmitCode = () => {
    const { errors, onSubmitCode, values } = this.props
    const { validationCode } = values

    if (!errors.validationCode) {
      onSubmitCode(validationCode)
    }
  }

  _isPhoneNumberPending = () => {
    const { initialPhoneNumber, initialPhoneNumberVerified } = this.props
    return !isBlank(initialPhoneNumber) && !initialPhoneNumberVerified
  }

  componentDidUpdate (prevProps) {
    // If new phone number and verified status are received,
    // then reset/clear the inputs.
    if (this.props.phoneNumber !== prevProps.phoneNumber ||
        this.props.isPhoneNumberVerified !== prevProps.isPhoneNumberVerified
    ) {
      this._handleCancelEditNumber()
      this.props.resetForm()
    }
  }

  render () {
    const {
      errors, // Formik prop
      initialPhoneNumber,
      intl,
      phoneFormatOptions,
      touched // Formik prop
    } = this.props
    const { isEditing, newPhoneNumber } = this.state
    const isPending = this._isPhoneNumberPending()

    // Here are the states we are dealing with:
    // - First time entering a phone number/validation code (blank value, not modified)
    //   => no color, no feedback indication.
    // - Typing backspace all the way to erase a number/code (blank value, modified)
    //   => red error.
    // - Typing a phone number that doesn't match the configured phoneNumberRegEx
    //   => red error.
    const isPhoneInvalid = !isPossiblePhoneNumber(newPhoneNumber)
    const showPhoneError = isPhoneInvalid && !isBlank(newPhoneNumber)
    const phoneErrorState = showPhoneError ? 'error' : null
    const codeErrorState = getErrorStates(this.props).validationCode

    return (
      <>
        {isEditing
          ? (
            // FIXME: If removing the Save/Cancel buttons on the account screen,
            // make this <FormGroup> a <form> and remove onKeyDown handler.
            <FormGroup validationState={phoneErrorState}>
              <ControlLabel>
                <FormattedMessage id='components.PhoneNumberEditor.prompt' />
              </ControlLabel>
              <ControlStrip>
                <InlinePhoneInput
                  className='form-control'
                  country={phoneFormatOptions.countryCode}
                  onChange={this._handleNewPhoneNumberChange}
                  onKeyDown={this._handlePhoneNumberKeyDown}
                  placeholder={intl.formatMessage({id: 'components.PhoneNumberEditor.placeholder'})}
                  type='tel'
                  value={newPhoneNumber}
                />
                <Button
                  bsStyle='primary'
                  disabled={isPhoneInvalid}
                  onClick={this._handleRequestCode}
                >
                  <FormattedMessage id='components.PhoneNumberEditor.sendVerificationText' />
                </Button>
                { // Show cancel button only if a phone number is already recorded.
                  initialPhoneNumber && (
                    <Button onClick={this._handleCancelEditNumber}>
                      <FormattedMessage id='common.forms.cancel' />
                    </Button>
                  )}
                {showPhoneError && (
                  <HelpBlock>
                    <FormattedMessage id='components.PhoneNumberEditor.invalidPhone' />
                  </HelpBlock>
                )}
              </ControlStrip>
            </FormGroup>
          ) : (
            <FormGroup>
              <ControlLabel>
                <FormattedMessage id='components.PhoneNumberEditor.smsDetail' />
              </ControlLabel>
              <ControlStrip>
                <InlineStatic>
                  {formatPhoneNumber(initialPhoneNumber)}
                  {' '}
                  {isPending
                    ? (
                      // eslint-disable-next-line jsx-a11y/label-has-for
                      <Label bsStyle='warning'>
                        <FormattedMessage id='components.PhoneNumberEditor.pending' />
                      </Label>
                    )
                    : (
                      // eslint-disable-next-line jsx-a11y/label-has-for
                      <Label bsStyle='success'>
                        <FormattedMessage id='components.PhoneNumberEditor.verified' />
                      </Label>
                    )
                  }
                </InlineStatic>
                <Button onClick={this._handleEditNumber}>
                  <FormattedMessage id='components.PhoneNumberEditor.changeNumber' />
                </Button>
              </ControlStrip>
            </FormGroup>
          )}

        {isPending && !isEditing && (
          // FIXME: If removing the Save/Cancel buttons on the account screen,
          // make this <FormGroup> a <form> and remove onKeyDown handler.
          <FormGroup validationState={codeErrorState}>
            <p>
              <FormattedMessage id='components.PhoneNumberEditor.verificationInstructions' />
            </p>
            <ControlLabel>
              <FormattedMessage id='components.PhoneNumberEditor.verificationCode' />
            </ControlLabel>
            <ControlStrip>
              <Field as={InlineTextInput}
                maxLength={6}
                name='validationCode'
                onKeyDown={this._handleValidationCodeKeyDown}
                placeholder='123456'
                // HACK: <input type='tel'> triggers the numerical keypad on mobile devices, and otherwise
                // behaves like <input type='text'> with support of leading zeros and the maxLength prop.
                // <input type='number'> causes values to be stored as Number, resulting in
                // leading zeros to be invalid and stripped upon submission.
                type='tel'

                // onBlur, onChange, and value are passed automatically by Formik
              />
              <Button
                bsStyle='primary'
                disabled={!!errors.validationCode}
                onClick={this._handleSubmitCode}
              >
                <FormattedMessage id='components.PhoneNumberEditor.verify' />
              </Button>
              {touched.validationCode && errors.validationCode && (
                <HelpBlock>
                  <FormattedMessage id='components.PhoneNumberEditor.invalidCode' />
                </HelpBlock>
              )}
            </ControlStrip>
            <FlushLink bsStyle='link' onClick={this._handleRequestCode}>
              <FormattedMessage id='components.PhoneNumberEditor.requestNewCode' />
            </FlushLink>
          </FormGroup>
        )}
      </>
    )
  }
}

const PhoneNumberEditorWithIntl = injectIntl(PhoneNumberEditor)
