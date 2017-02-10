export function isTransit (mode) {
  const transitModes = ['TRAM', 'BUS']
  return transitModes.indexOf(mode) !== -1
}
