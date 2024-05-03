import colors from '@opentripplanner/building-blocks'

const { blue, grey, red } = colors

/**
 * A red color similar to Bootstrap's "alert" background #d9534f,
 * but with enough contrast over white backgrounds
 */
const RED_ON_WHITE = red[800]

/**
 * A gray color similar to #808080 or #888,
 * but with enough contrast on white backgrounds.
 */
const GRAY_ON_WHITE = grey[700]

/**
 * A blue for links and blue text on white
 */

const BLUE_ON_WHITE = blue[800]

export { grey, red, blue, RED_ON_WHITE, GRAY_ON_WHITE, BLUE_ON_WHITE }
