/**
 * Determine if an itinerary has accessibility scores
 */
export const itineraryHasAccessibilityScores = (itinerary) => {
  return !!itinerary.legs.find((leg) => !!leg.accessibilityScore)
}
