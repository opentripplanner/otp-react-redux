import { isAccessMode } from './itinerary'

export function ensureSingleAccessMode (queryModes) {
  // Count the number of access modes
  const accessCount = queryModes.filter(m => isAccessMode(m)).length

  // If multiple access modes are specified, keep only the first one
  if (accessCount > 1) {
    const firstAccess = queryModes.find(m => isAccessMode(m))
    queryModes = queryModes.filter(m => !isAccessMode(m) || m === firstAccess)

  // If no access modes are specified, add 'WALK' as the default
  } else if (accessCount === 0) {
    queryModes.push('WALK')
  }

  return queryModes
}
