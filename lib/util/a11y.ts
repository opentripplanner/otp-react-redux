/**
 * Returns a phone number formatted so that screen readers read them digit by digit with a pause for digit groupings
 * (following advice from https://jhalabi.com/blog/accessibility-phone-number-formatting).
 * This method does not handle locale-specific digit groupings.
 */
export function getAriaPhoneNumber(formattedNumber: string): string {
  return `${formattedNumber
    // Remove opening parenthesis, replace closing parenthesis and dashes with period.
    .replace(/\s*\(\s*/g, '')
    .replace(/\s*\)\s*/g, '.')
    .replace('-', '.')
    // insert (normalize) spaces between each number
    .replace(/\s*(\d)/g, ' $1')
    .trim()}.`
}
