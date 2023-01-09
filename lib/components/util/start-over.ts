import qs from 'qs'

const startOver = (basename?: string, search?: string): string => {
  let startOverUrl = '/'
  if (basename) {
    startOverUrl += basename
  }
  // If search contains sessionId, preserve this so that the current session
  // is not lost when the page reloads.
  if (search) {
    const params = qs.parse(search, { ignoreQueryPrefix: true })
    const { sessionId } = params
    if (sessionId) {
      startOverUrl += `?${qs.stringify({ sessionId })}`
    }
  }
  return startOverUrl
}

export default startOver
