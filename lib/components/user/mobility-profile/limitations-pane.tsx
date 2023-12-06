import { FormattedMessage, useIntl } from 'react-intl'
import { FormGroup } from 'react-bootstrap'
import { FormikProps } from 'formik'
import React from 'react'
import styled from 'styled-components'

import { Options, Select, YesNoOptions } from '../common/dropdown-options'
import { User, VisionLimitation, visionLimitations } from '../types'

const Container = styled.div`
  select {
    width: unset; /* Otherwise, it is 100% per bootstrap. */
  }
`

/**
 * Produces a list of options for vision limitations.
 */
function VisionOptions(): JSX.Element {
  // <FormattedMessage> can't be used inside <option>.
  const intl = useIntl()
  const options = visionLimitations.map((value: VisionLimitation) => ({
    text: intl.formatMessage({
      id: `components.MobilityProfile.LimitationsPane.visionLimitations.${value}`
    }),
    value
  }))
  return <Options options={options} />
}

/**
 * Ability limitations pane, part of mobility profile.
 */
const LimitationsPane = ({
  handleChange,
  values: userData
}: FormikProps<User>): JSX.Element => {
  return (
    <Container>
      <p>
        <FormattedMessage id="components.MobilityProfile.intro" />
      </p>
      <FormGroup>
        <Select
          defaultValue={false}
          label={
            <FormattedMessage id="components.MobilityProfile.LimitationsPane.mobilityPrompt" />
          }
          name="mobilityProfile.isMobilityLimited"
          // Override onChange explicitly to use the custom one for existing accounts.
          // (The Formik's one will still be used for new accounts.)
          onChange={handleChange}
        >
          <YesNoOptions hideDefaultIndication />
        </Select>
      </FormGroup>
      <FormGroup>
        <Select
          label={
            <FormattedMessage id="components.MobilityProfile.LimitationsPane.visionPrompt" />
          }
          name="mobilityProfile.visionLimitation"
          // Override onChange explicitly to use the custom one for existing accounts.
          // (The Formik's one will still be used for new accounts.)
          onChange={handleChange}
        >
          <VisionOptions />
        </Select>
      </FormGroup>
    </Container>
  )
}

export default LimitationsPane
