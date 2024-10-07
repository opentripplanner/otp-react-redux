import { addDays, nextSunday, previousSunday } from 'date-fns'
/** Gets the current service week */
export const getCurrentServiceWeek = (): {
  end: string
  start: string
} => {
  const start = previousSunday(new Date()).toISOString().split('T')[0]
  const end = addDays(nextSunday(new Date()), 1).toISOString().split('T')[0]
  return { end, start }
}
