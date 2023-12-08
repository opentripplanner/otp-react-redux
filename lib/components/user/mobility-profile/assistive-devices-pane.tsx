import { Field, FormikProps } from 'formik'
import { FormattedMessage } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { FieldSet } from '../styled'
import { User } from '../types'

const knownDeviceCodes = [
  'none',
  'white cane',
  'manual walker',
  'wheeled walker',
  'cane',
  'crutches',
  'stroller',
  'service animal',
  'mobility scooter',
  'electric wheelchair',
  'manual wheelchair'
]

const DeviceOption = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 0.5em;
  margin-bottom: 5px;
  min-width: 300px;
  width: 50%;

  label {
    font-weight: normal;
    margin: 4px 0 0; /* match bootstrap's checkbox for better vert. align */
  }
`

/**
 * Assistive devices pane, part of mobility profile.
 */
const AssistiveDevicesPane = ({
  handleChange
}: FormikProps<User>): JSX.Element => (
  <div>
    <p>
      <FormattedMessage id="components.MobilityProfile.intro" />
    </p>
    <FieldSet>
      <legend>
        <FormattedMessage id="components.MobilityProfile.DevicesPane.prompt" />
      </legend>
      <div>
        {knownDeviceCodes.map((dv) => {
          const inputId = `device-option-${dv}`
          return (
            <DeviceOption key={dv}>
              <Field
                id={inputId}
                name="mobilityProfile.mobilityDevices"
                // Override onChange explicitly to use the custom one for existing accounts.
                // (The Formik's one will still be used for new accounts.)
                onChange={handleChange}
                type="checkbox"
                value={dv}
              />
              <label htmlFor={inputId}>
                <FormattedMessage
                  id={`components.MobilityProfile.DevicesPane.devices.${dv}`}
                />
              </label>
            </DeviceOption>
          )
        })}
      </div>
    </FieldSet>
  </div>
)

export default AssistiveDevicesPane
