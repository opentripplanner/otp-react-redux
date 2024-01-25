import { connect } from 'react-redux'
import { replace } from 'connected-react-router'
import { User, withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component, ReactElement } from 'react'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import {
  CREATE_ACCOUNT_PATH,
  CREATE_ACCOUNT_TERMS_PATH,
  CREATE_ACCOUNT_VERIFY_PATH
} from '../../util/constants'
import { PopupTargetConfig } from '../../util/config-types'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import AppFrame from '../app/app-frame'
import PopupWrapper from '../app/popup'

import SubNav from './sub-nav'
import withLoggedInUserSupport from './with-logged-in-user-support'

interface Props {
  children: ReactElement
  isTermsOrVerifyPage: boolean
  loggedInUser: User
  popupContent: PopupTargetConfig
  routeTo: (url: string, arg2: any, arg3: any) => void
  setPopupContent: (url: string | null) => void
  subnav: boolean
}

/**
 * This component contains common navigation elements and wrappers and should
 * wrap any user account page (e.g., SavedTripList or account settings).
 */
class AccountPage extends Component<Props> {
  /**
   * If a user signed up in Auth0 and did not complete the New Account wizard
   * (and they are not on or have not just left the Terms and Conditions page),
   * make the user finish set up their accounts first.
   * monitoredTrips should not be null otherwise.
   * NOTE: This check applies to any route that makes use of this component.
   */

  _checkAccountCreated = () => {
    const { isTermsOrVerifyPage, loggedInUser, routeTo } = this.props

    if (!loggedInUser.hasConsentedToTerms && !isTermsOrVerifyPage) {
      routeTo(CREATE_ACCOUNT_PATH, null, replace)
    }
  }

  componentDidMount() {
    this._checkAccountCreated()
  }

  render() {
    const {
      children,
      popupContent,
      setPopupContent,
      subnav = true
    } = this.props
    return (
      // @ts-expect-error TODO: add typing for SubNav
      <AppFrame SubNav={subnav && SubNav}>
        <PopupWrapper
          content={popupContent}
          hideModal={() => {
            if (setPopupContent) setPopupContent(null)
          }}
        />

        {children}
      </AppFrame>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const currentPath = state.router.location.pathname
  return {
    isTermsOrVerifyPage:
      currentPath === CREATE_ACCOUNT_TERMS_PATH ||
      currentPath === CREATE_ACCOUNT_VERIFY_PATH,
    loggedInUser: state.user.loggedInUser,
    popupContent: state.otp.ui.popup
  }
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo,
  setPopupContent: uiActions.setPopupContent
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(AccountPage),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
