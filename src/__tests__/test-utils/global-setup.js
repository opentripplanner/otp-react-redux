/**
 * Performs setup of the test environment outside of the browser. This is where
 * items such as environment variables can be set.
 */
module.exports = async () => {
  process.env.TZ = 'America/Los_Angeles'
}
