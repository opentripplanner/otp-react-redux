import colors from '@opentripplanner/building-blocks'
import tinycolor, { Instance } from 'tinycolor2'

const { blue, grey, red } = colors

/**
 * Finds the custom base color set in the configuration
 */
export const getBaseColor = (): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(
    '--main-base-color'
  )
}

export const getDarkenedBaseColor = (): Instance => {
  return tinycolor(getBaseColor()).darken(10)
}

/**
 * A red color similar to Bootstrap's "alert" background #d9534f,
 * but with WCAG AAA contrast
 */
const RED_ON_WHITE = red[800]

/**
 * A gray color similar to #808080 or #888,
 * but with WCAG AA contrast.
 */
const GREY_ON_WHITE = grey[700]

/**
 * A blue with WCAG AAA contrast on white backgrounds
 */
const BLUE_ON_WHITE = blue[800]

const DARK_TEXT_GREY = '#333'

const DEFAULT_ROUTE_COLOR = grey[800]

const ELEVATION_BLUE = blue[400]

export {
  grey,
  red,
  blue,
  DARK_TEXT_GREY,
  DEFAULT_ROUTE_COLOR,
  ELEVATION_BLUE,
  RED_ON_WHITE,
  GREY_ON_WHITE,
  BLUE_ON_WHITE
}
