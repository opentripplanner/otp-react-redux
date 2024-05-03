import colors from '@opentripplanner/building-blocks'

const { blue, grey, red } = colors

/**
 * A red color similar to Bootstrap's "alert" background #d9534f,
 * but with WCAG AAA contrast
 */
const RED_ON_WHITE = red[800]

/**
 * A gray color similar to #808080 or #888,
 * but with WCAG AA contrast.
 */
const GRAY_ON_WHITE = grey[700]

/**
 * A blue with WCAG AAA contrast on white backgrounds
 */

const BLUE_ON_WHITE = blue[800]

const DARK_TEXT_GREY = '#333'

export {
  grey,
  red,
  blue,
  DARK_TEXT_GREY,
  RED_ON_WHITE,
  GRAY_ON_WHITE,
  BLUE_ON_WHITE
}
