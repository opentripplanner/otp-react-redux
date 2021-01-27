import React from 'react'
import { connect } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'

/**
 * This function creates routing components from the ones imported above
 * that preserve the itinerary search query from the redux state
 * when redirecting the user between the main map and pages such as the My Settings page.
 * Implementers only need to specify the 'to' route and
 * do not need to hook to redux store to retrieve the itinerary search query.
 * @param LinkComponent The link component to enhance.
 * @returns A new component that passes the redux search params to
 *          LinkComponent's 'to' prop.
 */
const connectLink = LinkComponent =>
  ({ children, queryParams, to, ...props }) => (
    <LinkComponent {...props} to={{ pathname: to, search: queryParams }}>
      {children}
    </LinkComponent>
  )

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  return {
    queryParams: state.router.location.search
  }
}

const mapDispatchToProps = {
}

export default {
  Link: connect(mapStateToProps, mapDispatchToProps)(connectLink(Link)),
  LinkContainer: connect(mapStateToProps, mapDispatchToProps)(connectLink(LinkContainer)),
  Redirect: connect(mapStateToProps, mapDispatchToProps)(connectLink(Redirect))
}
