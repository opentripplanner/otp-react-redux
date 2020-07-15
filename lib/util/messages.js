/**
 * Takes component's default props and its instance props and returns the
 * merged messages props. The returned object will ensure that the default
 * messages are substituted for any translation strings that were missing in the
 * props. Note: this does not account for messages in nested objects (e.g.,
 * messages.header.description).
 */
export function mergeMessages (defaultProps, props) {
  const defaultMessages = defaultProps.messages || {}
  const propsMessages = props.messages || {}
  return {
    ...defaultMessages,
    ...propsMessages
  }
}
