import { withAuthenticationRequired } from '@auth0/auth0-react'
import { replace } from 'connected-react-router'
import React, { Component } from 'react'
import { Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as uiActions from '../../actions/ui'
import { CREATE_ACCOUNT_TERMS_PATH } from '../../util/constants'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import withLoggedInUserSupport from './with-logged-in-user-support'
import DesktopNav from '../app/desktop-nav'
import SubNav from './sub-nav'

/**
 * This component contains common navigation elements and wrappers and should
 * wrap any user account page (e.g., SavedTripList or account settings).
 */
class AccountPage extends Component {
  /**
   * If a user signed up in Auth0 and did not complete the New Account wizard
   * (and they are not on or have not just left the Terms and Conditions page),
   * make the user finish set up their accounts first.
   * monitoredTrips should not be null otherwise.
   * NOTE: This check applies to any route that makes use of this component.
   */
  _checkAccountCreated = () => {
    const { isTermsPage, loggedInUser, routeTo } = this.props

    if (!loggedInUser.hasConsentedToTerms && !isTermsPage) {
      routeTo(CREATE_ACCOUNT_TERMS_PATH, null, replace)
    }
  }

  componentDidMount () {
    this._checkAccountCreated()
  }

  render () {
    const {children, subnav = true} = this.props
    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
        {subnav && <SubNav />}
        <div className='container'>
          <Row xs={12}>
            <Col xs={12} sm={10} smOffset={1} md={8} mdOffset={2}>
              {children}
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const currentPath = state.router.location.pathname
  return {
    isTermsPage: currentPath === CREATE_ACCOUNT_TERMS_PATH,
    loggedInUser: state.user.loggedInUser,
    trips: state.user.loggedInUserMonitoredTrips
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(AccountPage),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
