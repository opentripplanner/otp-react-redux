import { latLngBounds } from 'leaflet'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import ModeIcon from '../components/icons/mode-icon'

/**
 * Returns a react element of the desired icon. If customIcons are defined, then
 * the icon will be attempted to be used from that lookup of icons. Otherwise,
 * a ModeIcon element will be returned.
 *
 * @param  {string} iconId  A string with the desired icon ID. This icon can
 * include modes or companies or anything that is defined in the customIcons.
 * @param  {[Map<string, React.Element>]} customIcons A customized lookup of
 * icons. These are defined as part of the implementing webapp. If this lookup
 * is not defined, then the ModeIcon class will be used instead.
 * @return {React.Element}
 */
export function getIcon (iconId, customIcons) {
  // Check if there is a custom icon
  if (customIcons && iconId in customIcons) {
    return customIcons[iconId]
  }

  // Custom icon not available for the given iconId. Use the ModeIcon component
  // to show the icon based on the iconId, but always use the default car icon
  // for any car-based modes that didn't have custom icon
  if (iconId && iconId.startsWith('CAR')) iconId = 'CAR'
  return <ModeIcon mode={iconId} />
}

export function getLeafletItineraryBounds (itinerary) {
  return latLngBounds(coreUtils.itinerary.getItineraryBounds(itinerary))
}

/**
 * Return a leaflet LatLngBounds object that encloses the given leg's geometry.
 */
export function getLeafletLegBounds (leg) {
  return latLngBounds(coreUtils.itinerary.getLegBounds(leg))
}

/**
 * Return an icon depending on the leg info
 *
 * @param  {Object} leg  The leg data of an itinerary in an OTP trip plan result
 * @param  {[Object]} customIcons If defined for this webapp, the custom icons
 * consist of a lookup table of icons to return for a specific icon ID. These
 * icons typically show either companies or transport modes, but they could show
 * other icons too. See this file in trimet-mod-otp for an example setup:
 * https://github.com/ibi-group/trimet-mod-otp/blob/6a32e2142655c4f4d09a3f349b971b7505e2866a/lib/icons/index.js#L24-L55
 */
export function getLegIcon (leg, customIcons) {
  // check if a custom function exists for determining the icon for a leg
  if (customIcons && typeof customIcons.customIconForLeg === 'function') {
    // function exits, get the icon string lookup. It's possible for there to be
    // a custom function that only returns a string for when a leg meets the
    // criteria of the custom function
    const customIconStr = customIcons.customIconForLeg(leg)
    // the customIconStr could be undefined for this leg, but if it is not, then
    // immediately return this custom icon for the leg
    if (customIconStr) return getIcon(customIconStr, customIcons)
  }
  let iconStr = leg.mode
  if (iconStr === 'CAR' && leg.rentedCar) {
    iconStr = leg.from.networks[0]
  } else if (iconStr === 'CAR' && leg.tncData) {
    iconStr = leg.tncData.company
  } else if (iconStr === 'BICYCLE' && leg.rentedBike && leg.from.networks) {
    iconStr = leg.from.networks[0]
  } else if (iconStr === 'MICROMOBILITY' && leg.rentedVehicle && leg.from.networks) {
    iconStr = leg.from.networks[0]
  }

  return getIcon(iconStr, customIcons)
}
