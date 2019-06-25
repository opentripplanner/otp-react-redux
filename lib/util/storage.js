// Prefix to use with local storage keys.
const STORAGE_PREFIX = 'otp'

/**
 * Store a javascript object at the specified key.
 */
export function storeItem (key, object) {
  window.localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(object))
}

/**
 * Retrieve a javascript object at the specified key. If not found, defaults to
 * null or, the optionally provided notFoundValue.
 */
export function getItem (key, notFoundValue = null) {
  let itemAsString
  try {
    itemAsString = window.localStorage.getItem(`${STORAGE_PREFIX}.${key}`)
    const json = JSON.parse(itemAsString)
    if (json) return json
    else return notFoundValue
  } catch (e) {
    // Catch any errors associated with parsing bad JSON.
    console.warn(e, itemAsString)
    return notFoundValue
  }
}

/**
 * Remove item at specified key.
 */
export function removeItem (key) {
  window.localStorage.removeItem(`${STORAGE_PREFIX}.${key}`)
}
