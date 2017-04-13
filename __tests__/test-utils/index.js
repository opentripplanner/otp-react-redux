export function timeoutPromise (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}
