import PropTypes from 'prop-types'
import React from 'react'
// FIXME: This dependency is restricting typescripting of this file
import {
  ClassicBus,
  ClassicGondola,
  ClassicModeIcon,
  Ferry,
  LegIcon,
  StandardGondola
} from '@opentripplanner/icons'

/**
 * For more advanced users, you can replicate and customize components and
 * observe the change in icons.
 * - For LegIcon: https://github.com/opentripplanner/otp-ui/blob/master/packages/icons/src/trimet-leg-icon.js
 * - For ModeIcon: https://github.com/opentripplanner/otp-ui/blob/master/packages/icons/src/trimet-mode-icon.js
 * The example below shuffles some icons around from what you might normally
 * expect for demonstration purposes.
 */

const CustomTransitIcon = Ferry
const CustomRailIcon = ClassicGondola
const CustomStreetcarIcon = StandardGondola
const CustomBikeRentalIcon = ClassicBus

/**
 * This component renders a custom icon for a passed mode
 */
export const CustomModeIcon = ({ mode, ...props }) => {
  if (!mode) return null
  switch (mode.toLowerCase()) {
    // Place custom icons for each mode here.
    case 'transit':
      return <CustomTransitIcon {...props} />
    case 'rail':
      return <CustomRailIcon {...props} />
    default:
      return <ClassicModeIcon mode={mode} {...props} />
  }
}
CustomModeIcon.propTypes = {
  mode: PropTypes.string
}

/**
 * This component renders a custom icon for a mode given a passed leg
 */
export const CustomLegIcon = ({ leg, ...props }) => {
  if (leg.routeLongName && leg.routeLongName.startsWith('MAX')) {
    return <CustomStreetcarIcon />
  } else if (leg.rentedBike) {
    return <CustomBikeRentalIcon />
  }
  return <LegIcon leg={leg} ModeIcon={CustomModeIcon} {...props} />
}
CustomLegIcon.propTypes = {
  leg: PropTypes.shape({
    rentedBike: PropTypes.bool,
    routeLongName: PropTypes.string
  })
}
