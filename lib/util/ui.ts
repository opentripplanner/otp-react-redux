import { FormikProps } from 'formik'

/**
 * @param string the string to test.
 * @returns true if the string is null or of zero length.
 */
export function isBlank(string?: string): boolean {
  return !(!!string && string.length)
}

/**
 * Returns the route that is in place before a user accesses the login page,
 * e.g. if the URL is http://www.example.com/path/#/route?param=value,
 * only /route?param=value is returned. A blank string is returned at the minimum per substr() function.
 */
export function getCurrentRoute(): string {
  return window.location.hash.substr(1)
}

/**
 * Used in several components instantiated with auth0-react's withAuthenticationRequired(),
 * so that the browser returns to the route (hash) in place before the user accessed the login page,
 * e.g. /account/?ui_activeSearch=... without #.
 */
export const RETURN_TO_CURRENT_ROUTE = {
  returnTo: getCurrentRoute
}

/**
 * Computes the Bootstrap error states based on Formik's validation props.
 * @param {*} props The Formik props from which to extract the error states.
 * @returns An object where each field is set to 'error' if the
 *          corresponding Formik props denote an error for that field.
 */
export function getErrorStates(
  props: FormikProps<any>
): Record<string, 'error' | null> {
  const { errors, touched } = props
  const errorStates: Record<string, 'error' | null> = {}
  Object.keys(errors).forEach((name: string) => {
    errorStates[name] = touched[name] && errors[name] ? 'error' : null
  })

  return errorStates
}

/**
 * Browser navigate back.
 */
export const navigateBack = (): void => window.history.back()

/**
 * Capitalizes the first letter of a string.
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Assembles a path from a variable list of parts
 * @param  {...any} parts   List of string components to assemble into path
 * @returns                 A path made of the components passed in
 */
export function getPathFromParts(...parts: string[]): string {
  let path = ''
  parts.forEach((p: string) => {
    if (p) path += `/${p}`
  })
  return path
}
