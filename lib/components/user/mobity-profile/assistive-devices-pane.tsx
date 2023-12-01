import { Field, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import { FieldSet } from '../styled'
import { User } from '../types'

type Props = FormikProps<User>

const knownDeviceCodes = [
  'none',
  'white-cane',
  'manual-walker',
  'wheeled-walker',
  'cane',
  'crutches',
  'stroller',
  'service-animal',
  'mobility-scooter',
  'electric-wheelchair',
  'manual-wheelchair'
]

/**
 * Assistive devices pane, part of mobility profile.
 */
const AssistiveDevicesPane = ({
  handleChange,
  values: userData
}: Props): JSX.Element => {
  return (
    <div>
      <p>
        <FormattedMessage id="components.LimitationsPane.intro" />
      </p>
      <FieldSet>
        <legend>
          <FormattedMessage id="components.LimitationsPane.devicePrompt" />
        </legend>
        <ul>
          {knownDeviceCodes.map((dv) => {
            const inputId = `device-option-${dv}`
            return (
              <li key={dv}>
                <Field
                  id={inputId}
                  name="mobilityDevices"
                  type="checkbox"
                  value={dv}
                />

                <label htmlFor={inputId}>
                  <FormattedMessage
                    id={`components.LimitationsPane.devices.${dv}`}
                  />
                </label>
              </li>
            )
          })}
        </ul>
      </FieldSet>
    </div>
  )
}

export default AssistiveDevicesPane
