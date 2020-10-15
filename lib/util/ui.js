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
 */
export function formatPhoneNumber (rawNumber, phoneFormatOptions) {
  const { rawStructureRegExp, formattedStructure } = phoneFormatOptions

  if (rawStructureRegExp && formattedStructure) {
    return rawNumber.replace(new RegExp(rawStructureRegExp), formattedStructure)
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
