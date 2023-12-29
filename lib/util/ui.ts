/* eslint-disable camelcase */
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
 * @returns An object where each field is set to 'error' if:
 *   - the corresponding Formik props denote an error for that field, and.
 *   - the form has been submitted or a given field hasa been touched.
 */
export function getErrorStates(
  props: FormikProps<any>
): Record<string, 'error' | null> {
  const { errors, submitCount, touched } = props
  const errorStates: Record<string, 'error' | null> = {}
  Object.keys(errors).forEach((name) => {
    errorStates[name] =
      (submitCount > 0 || touched[name]) && errors[name] ? 'error' : null
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

/**
 * Enum to describe the layout of the itinerary view.
 */
export enum ItineraryView {
  /** One itinerary is shown. (In mobile view, the map is hidden.) */
  FULL = 'full',
  /** One itinerary is shown, itinerary and map are focused on a leg. (The mobile view is split.) */
  LEG = 'leg',
  /** One itinerary leg is hidden. (In mobile view, the map is expanded.) */
  LEG_HIDDEN = 'leg-hidden',
  /** The list of itineraries is shown. (The mobile view is split.) */
  LIST = 'list',
  /** The list of itineraries is hidden. (In mobile view, the map is expanded.) */
  LIST_HIDDEN = 'list-hidden'
}

interface UrlParams {
  ui_activeItinerary: number | string
  ui_itineraryView: ItineraryView
}

export function isDefinedAndNotEqual(
  subject: number | string,
  value: number | string
): boolean {
  return (
    subject !== null && subject !== undefined && `${subject}` !== `${value}`
  )
}

/**
 * Gets the itinerary view to display based on URL params.
 */
export function getItineraryView({
  ui_activeItinerary,
  ui_itineraryView
}: UrlParams): ItineraryView {
  return (
    ((ui_activeItinerary === null ||
      ui_activeItinerary === undefined ||
      `${ui_activeItinerary}` === '-1') &&
      (ui_itineraryView === ItineraryView.LIST_HIDDEN
        ? ItineraryView.LIST_HIDDEN
        : ItineraryView.LIST)) ||
    ui_itineraryView ||
    (isDefinedAndNotEqual(ui_activeItinerary, -1) && ItineraryView.FULL) ||
    ItineraryView.LIST
  )
}

/**
 * Gets the new itinerary view to display based on current view.
 */
export function getMapToggleNewItineraryView(
  currentView: ItineraryView
): ItineraryView {
  switch (currentView) {
    case ItineraryView.LEG:
      return ItineraryView.LEG_HIDDEN
    case ItineraryView.LIST:
      return ItineraryView.LIST_HIDDEN
    case ItineraryView.LEG_HIDDEN:
      return ItineraryView.LEG
    default:
      return ItineraryView.LIST
  }
}
