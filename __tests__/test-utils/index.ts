// Sun Aug 04 2019 19:34:56 GMT-0700
const DEFAULT_TEST_TIME = Date.UTC(2019, 7, 5, 2, 34, 56, 78)

export function timeoutPromise(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Temporarily change the internal behavior of the Date.now method such that it
 * returns a time that is based off of the given value in milliseconds after
 * the epoch. Typically the method Date.UTC(YYYY, MM, DD) can be used to
 * generate this number.
 *
 * Note: this stack overflow page gives more info on why we're using this:
 * https://stackoverflow.com/a/42787232/915811 (basically, moment.js uses
 * Date#now internally).
 */
export function setTestTime(time: number): void {
  const date = new Date(time)
  // Log human-readable date to help out human testers.
  console.log(`Setting test time to ${date}`)
  jest.spyOn(Date, 'now').mockImplementation(() => date.valueOf())
}

/**
 * Sets the default mock test time for a variety of tests such that various
 * calculations and feed version statuses resolve to a certain state.
 */
export function setDefaultTestTime(): void {
  setTestTime(DEFAULT_TEST_TIME)
}

/**
 * Restore the standard functionality of Date library. This should be used in
 * the afterEach clause in test suites that require a mocked date.
 */
export function restoreDateNowBehavior(): void {
  const now = Date.now as jest.Mock
  now.mockRestore && now.mockRestore()
}
