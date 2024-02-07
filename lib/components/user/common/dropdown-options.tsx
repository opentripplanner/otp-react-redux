import { Field } from 'formik'
import { FormControl } from 'react-bootstrap'
import { IntlShape, useIntl } from 'react-intl'
import React, { ChangeEventHandler, ComponentType, ReactNode } from 'react'

interface SelectProps {
  Control?: ComponentType
  children: ReactNode
  defaultValue?: string | number | boolean
  label?: ReactNode
  name: string
  onChange?: ChangeEventHandler
}

/**
 * A label followed by a dropdown control.
 */
export const Select = ({
  Control = FormControl,
  children,
  defaultValue,
  label,
  name,
  onChange
}: SelectProps): JSX.Element => {
  const fieldProps = {
    as: Control,
    componentClass: 'select',
    defaultValue,
    id: name,
    name,
    onChange
  }
  /* Passing an onChange will override Formik's onChange, so only pass if onChange exists. */
  if (!onChange) delete fieldProps.onChange
  return (
    // <Field> is kept outside of <label> to accommodate layout in table/grid cells.
    <>
      {label && <label htmlFor={name}>{label}</label>}
      <Field {...fieldProps}>{children}</Field>
    </>
  )
}

interface OptionsPropsBase<T> {
  defaultValue?: T
  hideDefaultIndication?: boolean
}

interface OptionsProps<T extends string | number> extends OptionsPropsBase<T> {
  options: { text: string; value: T }[]
}

export function Options<T extends string | number>({
  defaultValue,
  hideDefaultIndication,
  options
}: OptionsProps<T>): JSX.Element {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  return (
    <>
      {options.map(({ text, value }, i) => (
        <option key={i} value={value}>
          {!hideDefaultIndication && value === defaultValue
            ? intl.formatMessage(
                { id: 'common.forms.defaultValue' },
                { value: text }
              )
            : text}
        </option>
      ))}
    </>
  )
}

const basicYesNoOptions = [
  {
    id: 'yes',
    value: 'true'
  },
  {
    id: 'no',
    value: 'false'
  }
]

/**
 * Produces a yes/no list of options with the specified
 * default value (true for yes, false for no).
 */
export function YesNoOptions({
  defaultValue,
  hideDefaultIndication
}: OptionsPropsBase<boolean>): JSX.Element {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  const options = basicYesNoOptions.map(({ id, value }) => ({
    text: intl.formatMessage({ id: `common.forms.${id}` }),
    value
  }))
  return (
    <Options
      defaultValue={(defaultValue || false).toString()}
      hideDefaultIndication={hideDefaultIndication}
      options={options}
    />
  )
}

interface DurationOptionsProps extends OptionsPropsBase<number> {
  decoratorFunc?: (text: string, intl: IntlShape) => string
  minuteOptions: number[]
}

/**
 * Produces a list of duration options with the specified default value.
 */
export function DurationOptions({
  decoratorFunc,
  defaultValue,
  minuteOptions
}: DurationOptionsProps): JSX.Element {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  const localizedMinutes = minuteOptions.map((minutes) => ({
    text:
      minutes === 60
        ? intl.formatMessage({ id: 'components.TripNotificationsPane.oneHour' })
        : intl.formatMessage(
            { id: 'common.time.tripDurationFormat' },
            { hours: 0, minutes, seconds: 0 }
          ),
    value: minutes
  }))
  const options = decoratorFunc
    ? localizedMinutes.map(({ text, value }) => ({
        text: decoratorFunc(text, intl),
        value
      }))
    : localizedMinutes
  return <Options defaultValue={defaultValue} options={options} />
}
