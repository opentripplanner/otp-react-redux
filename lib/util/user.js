
export function isNewUser (loggedInUser) {
  return !loggedInUser.hasConsentedToTerms
}
