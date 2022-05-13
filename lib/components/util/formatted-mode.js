import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

/**
 * Returns a FormattedMessage component for the "travel by" mode such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
 */
// eslint-disable-next-line complexity
const FormattedMode = ({ mode }) => {
  switch (mode) {
    case 'bicycle':
      return <FormattedMessage id="common.modes.bike" />
    case 'bicycle_rent':
      return <FormattedMessage id="common.modes.bicycle_rent" />
    case 'bus':
      return <FormattedMessage id="common.modes.bus" />
    case 'cable_car':
      return <FormattedMessage id="common.modes.cable_car" />
    case 'car':
      return <FormattedMessage id="common.modes.car" />
    case 'car_park':
      return <FormattedMessage id="common.modes.car_park" />
    case 'drive':
      return <FormattedMessage id="common.modes.drive" />
    case 'ferry':
      return <FormattedMessage id="common.modes.ferry" />
    case 'flex_direct':
    case 'flex_egress':
    case 'flex_access':
      return <FormattedMessage id="common.modes.flex" />
    case 'funicular':
      return <FormattedMessage id="common.modes.funicular" />
    case 'gondola':
      return <FormattedMessage id="common.modes.gondola" />
    case 'micromobility':
    case 'scooter':
      return <FormattedMessage id="common.modes.micromobility" />
    case 'micromobility_rent':
    case 'scooter_rent':
      return <FormattedMessage id="common.modes.micromobility_rent" />
    case 'rail':
      return <FormattedMessage id="common.modes.rail" />
    case 'rent':
      return <FormattedMessage id="common.modes.rent" />
    case 'subway':
      return <FormattedMessage id="common.modes.subway" />
    case 'tram':
      return <FormattedMessage id="common.modes.tram" />
    case 'transit':
      return <FormattedMessage id="common.modes.transit" />
    case 'walk':
      return <FormattedMessage id="common.modes.walk" />
    default:
      return null
  }
}

FormattedMode.propTypes = {
  mode: PropTypes.string.isRequired
}

FormattedMode.defaultProps = {
  mode: ''
}

// For lowercase context
export const StyledFormattedMode = styled(FormattedMode)`
  text-transform: lowercase;
`
export default FormattedMode
