import React from 'react'
import { connect } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'

/**
 * This function enhances the routing components imported above
 * by preserving the itinerary search query from the redux state
 * when redirecting the user between the main map and account-related pages,
 * so that when the user returns to the map, the itinerary that was previously
 * displayed is shown again.
 * Implementers only need to specify the 'to' route and
 * do not need to hook to redux store to retrieve the itinerary search query.
 * @param RoutingComponent The routing component to enhance.
 * @returns A new component that passes the redux search params to
 *          the RoutingComponent's 'to' prop.
 */
const withQueryParams = RoutingComponent =>
  ({ children, queryParams, to, ...props }) => (
    <RoutingComponent {...props} to={{ pathname: to, search: queryParams }}>
      {children}
    </RoutingComponent>
  )

// For connecting to the redux store
const mapStateToProps = (state, ownProps) => {
  return {
    queryParams: state.router.location.search
  }
}

// Enhance routing components, connect the result to redux,
// and export.
export default {
  LinkWithQuery: connect(mapStateToProps)(withQueryParams(Link)),
  LinkContainerWithQuery: connect(mapStateToProps)(withQueryParams(LinkContainer)),
  RedirectWithQuery: connect(mapStateToProps)(withQueryParams(Redirect))
}
