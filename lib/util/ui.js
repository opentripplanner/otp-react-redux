import { Children, isValidElement, cloneElement } from 'react'

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

/**
 * Returns the route that is in place before a user accesses the login page,
 * e.g. if the URL is http://www.example.com/path/#/route?param=value,
 * only /route?param=value is returned. A blank string is returned at the minimum per substr() function.
 */
export function getCurrentRoute () {
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
