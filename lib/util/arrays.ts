/** Retrieves a key from a dictionary or adds it with the desired value if absent. */
export function getOrPutEntry<K extends string | number | symbol, V>(
  entries: Record<K, V>,
  key: K,
  newValue: (newKey: K) => V
): V {
  let entry = entries[key]
  if (!entry) {
    entries[key] = entry = newValue(key)
  }
  return entry
}
