/**
 * Determine if an itinerary has accessibility scores
 */
export const itineraryHasAccessibilityScore = (itinerary) => {
  return (
    // If accessibility score is 0, we still want to return true so use the -1 to
    // make sure all scores are returned even if they're 0.
    itinerary.accessibilityScore !== null && itinerary.accessibilityScore > -1
  )
}
