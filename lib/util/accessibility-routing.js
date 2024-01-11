/**
 * Determine if an itinerary has accessibility scores
 */
export const itineraryHasAccessibilityScore = (itinerary) => {
  return (
    // If accessibility score is 0, we still want to return true
    itinerary.accessibilityScore !== null && itinerary.accessibilityScore > -1
  )
}
