import { Field } from 'formik'
import { FormControl } from 'react-bootstrap'
import { useIntl } from 'react-intl'
import React from 'react'

/**
 * A label followed by a dropdown control.
 */
export const Select = ({
  Control = FormControl,
  children,
  label,
  name
}: {
  // Note the prop order required by typescript-sort-keys, also applied above.
  Control?: ComponentType
  children: ReactNode
  label?: ReactNode
  name: string
}): JSX.Element => (
  // <Field> is kept outside of <label> to accommodate layout in table/grid cells.
  <>
    {label && <label htmlFor={name}>{label}</label>}
    <Field as={Control} componentClass="select" id={name} name={name}>
      {children}
    </Field>
  </>
)

export function Options({
  defaultValue,
  options
}: {
  defaultValue: number | string
  options: { text: string; value: number | string }[]
}): JSX.Element {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  return (
    <>
      {options.map(({ text, value }, i) => (
        <option key={i} value={value}>
          {value === defaultValue
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
  defaultValue
}: {
  defaultValue: boolean
}): JSX.Element {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  const options = basicYesNoOptions.map(({ id, value }) => ({
    text:
      id === 'yes'
        ? intl.formatMessage({ id: 'common.forms.yes' })
        : intl.formatMessage({ id: 'common.forms.no' }),
    value
  }))
  return (
    <Options
      defaultValue={(defaultValue || false).toString()}
      options={options}
    />
  )
}

/**
 * Produces a list of duration options with the specified default value.
 */
export function DurationOptions({
  decoratorFunc,
  defaultValue,
  minuteOptions
}: {
  decoratorFunc?: (text: string, intl: IntlShape) => string
  defaultValue: string | number
  minuteOptions: number[]
}): JSX.Element {
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
