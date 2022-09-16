import React from 'react'

/** React hook to run a method on an interval
 * from https://www.joshwcomeau.com/snippets/react-hooks/use-interval/
 */
function useInterval(callback, delay) {
  const intervalRef = React.useRef()
  const savedCallback = React.useRef(callback)
  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  React.useEffect(() => {
    const tick = () => savedCallback.current()
    if (typeof delay === 'number') {
      intervalRef.current = window.setInterval(tick, delay)
      return () => window.clearInterval(intervalRef.current)
    }
  }, [delay])
  return intervalRef
}

export default useInterval
