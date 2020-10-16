import PhoneNumber from 'awesome-phonenumber'
import { Children, isValidElement, cloneElement } from 'react'

/**
 * @param {*} string the string to test.
 * @returns true if the string is null or of zero length.
 */
export function isBlank (string) {
  return !(string && string.length)
}

/**
 * Formats a phone number according to the structure and format in phoneFormatOptions.
 * @param {*} rawNumber The raw number (e.g. +155555555) to process
 * @param {*} phoneFormatOptions The phoneFormatOptions from the configuration.
 * @return The formatted number, or the raw number if no region code was provided.
 */
export function formatPhoneNumber (rawNumber, phoneFormatOptions) {
  const { regionCode } = phoneFormatOptions

  if (regionCode) {
    return new PhoneNumber(rawNumber, regionCode).getNumber('national')
  }
  return rawNumber
}

/**
 * Renders children with additional props.
 * Modified from
 * https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children#32371612
 * @param children the child elements to modify.
 * @param newProps the props to add.
 */
export function renderChildrenWithProps (children, newProps) {
  const childrenWithProps = Children.map(children, child => {
    // Checking isValidElement is the safe way and avoids a TS error too.
    if (isValidElement(child)) {
      return cloneElement(child, { ...newProps })
    }
    return child
  })

  return childrenWithProps
}
