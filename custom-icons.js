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

export const CustomLegIcon = ({ leg, ...props }) => {
  if (
    leg.routeLongName &&
    leg.routeLongName.startsWith('MAX')
  ) {
    return <CustomStreetcarIcon />
  } else if (leg.rentedBike) {
    return <CustomBikeRentalIcon />
  }
  return <LegIcon leg={leg} ModeIcon={CustomModeIcon} {...props} />
}
