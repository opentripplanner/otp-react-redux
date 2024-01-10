/**
 * Determine if an itinerary has accessibility scores
 */
export const itineraryHasAccessibilityScores = (itinerary) => {
  return (
    itinerary.accessibilityScore !== null && itinerary.accessibilityScore > -1
  )
}
