/**
 * Determine if an itinerary has accessibility scores
 */
export const itineraryHasAccessibilityScores = (itinerary) => {
  return !!itinerary.legs.find(leg => !!leg.accessibilityScore)
}

/**
 * Calculates the total itinerary score based on leg score by weighting
 * each leg equally
 */
export const getAccessibilityScoreForItinerary = (itinerary) => {
  const scores = itinerary.legs
    .map((leg) => leg.accessibilityScore || null)
    .filter((score) => score !== null)

  return scores.reduce((prev, cur) => prev + (cur * (1 / scores.length)), 0)
}
