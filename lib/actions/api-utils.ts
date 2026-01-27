import { TransportMode } from '@opentripplanner/types'

export const countFlexModes = (modes: TransportMode[]): number =>
  modes.filter((m) => m.mode === 'FLEX').length
