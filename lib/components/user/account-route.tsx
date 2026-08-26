import { connect } from 'react-redux'
import { replace } from 'connected-react-router'
import { Route, Switch } from 'react-router'
import { User, withAuthenticationRequired } from '@auth0/auth0-react'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
import {
  ACCOUNT_PATH,
  ACCOUNT_SETTINGS_PATH,
  CREATE_ACCOUNT_PATH,
  CREATE_ACCOUNT_PLACES_PATH,
  CREATE_ACCOUNT_TERMS_PATH,
  CREATE_ACCOUNT_VERIFY_PATH,
  MOBILITY_PATH,
  PLACES_PATH,
  TERMS_OF_SERVICE_PATH,
  TERMS_OF_STORAGE_PATH,
  TRIPS_PATH
} from '../../util/constants'
import { AppReduxState } from '../../util/state-types'
import { ComponentContext } from '../../util/contexts'
import { PopupTargetConfig } from '../../util/config-types'
import { RETURN_TO_CURRENT_ROUTE } from '../../util/ui'
import AppFrame from '../app/app-frame'
import AppModule from '../app/app-module'
import FavoritePlaceScreen from '../../components/user/places/favorite-place-screen'
import PopupWrapper from '../app/popup'
import RedirectWithQuery from '../../components/form/redirect-with-query'
import SavedTripList from '../../components/user/monitored-trip/saved-trip-list'
import SavedTripScreen from '../../components/user/monitored-trip/saved-trip-screen'
import UserAccountScreen from '../../components/user/user-account-screen'

import SubNav from './sub-nav'
import withLoggedInUserSupport from './with-logged-in-user-support'

interface Props {
  isTermsOrVerifyPage: boolean
  isWizard: boolean
  loggedInUser: User
  popupContent: PopupTargetConfig
  routeTo: (url: string, arg2: any, arg3: any) => void
  setPopupContent: (url: string | null) => void
}

/**
 * This component contains common navigation elements and wrappers and should
 * wrap any user account page (e.g., SavedTripList or account settings).
 */
class AccountRoute extends Component<Props> {
  static contextType = ComponentContext

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
    const { isWizard, popupContent, setPopupContent } = this.props
    const components = this.context

    return (
      <AppModule name="account">
        {/* @ts-expect-error TODO: add typing for SubNav */}
        <AppFrame SubNav={!isWizard && SubNav}>
          <PopupWrapper
            content={popupContent}
            hideModal={() => {
              if (setPopupContent) setPopupContent(null)
            }}
          />

          <Switch>
            <Route
              component={FavoritePlaceScreen}
              path={[`${CREATE_ACCOUNT_PLACES_PATH}/:id`, `${PLACES_PATH}/:id`]}
            />
            <Route component={SavedTripScreen} path={`${TRIPS_PATH}/:id`} />
            <Route exact path={ACCOUNT_PATH}>
              <RedirectWithQuery to={TRIPS_PATH} />
            </Route>
            <Route exact path={CREATE_ACCOUNT_PATH}>
              <RedirectWithQuery to={CREATE_ACCOUNT_VERIFY_PATH} />
            </Route>
            <Route
              component={UserAccountScreen}
              path={[
                `${CREATE_ACCOUNT_PATH}/:step`,
                `${MOBILITY_PATH}/:step`,
                `${MOBILITY_PATH}/`,
                ACCOUNT_SETTINGS_PATH
              ]}
            />
            <Route component={SavedTripList} path={TRIPS_PATH} />
            <Route
              component={components.TermsOfService}
              path={ACCOUNT_PATH + TERMS_OF_SERVICE_PATH}
            />
            <Route
              component={components.TermsOfStorage}
              path={ACCOUNT_PATH + TERMS_OF_STORAGE_PATH}
            />
          </Switch>
        </AppFrame>
      </AppModule>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const currentPath = state.router.location.pathname
  const basePath = [CREATE_ACCOUNT_PATH, MOBILITY_PATH].find((path) =>
    currentPath.startsWith(path)
  )
  return {
    isTermsOrVerifyPage:
      currentPath === CREATE_ACCOUNT_TERMS_PATH ||
      currentPath === CREATE_ACCOUNT_VERIFY_PATH,
    isWizard: !!basePath,
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
    connect(mapStateToProps, mapDispatchToProps)(AccountRoute),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
