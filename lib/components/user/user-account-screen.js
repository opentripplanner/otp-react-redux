import memoize from 'lodash.memoize'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Navbar } from 'react-bootstrap'
import { connect } from 'react-redux'

import { addUser, fetchUser, updateUser } from '../../util/middleware'
import { routeTo } from '../../actions/ui'
import AppMenu from '../app/app-menu'

import AccountCommands from './account-commands'
import accountSetupFinishPane from './account-setup-finish-pane'
import awaitingScreen from './awaiting-screen'
import FavoriteLocationsPane from './favorite-locations-pane'
import NotificationPrefsPane from './notification-prefs-pane'
import phoneVerificationPane from './phone-verification-pane'
import TermsOfUsePane from './terms-of-use-pane'
import verifyEmailScreen from './verify-email-screen'

function getStateForNewUser (auth0User) {
  return {
    auth0UserId: auth0User.sub,
    email: auth0User.email,
    hasConsentedToTerms: false, // User must agree to terms.
    isEmailVerified: auth0User.email_verified,
    notificationChannel: 'email',
    phoneNumber: '',
    recentLocations: [],
    savedLocations: [],
    storeTripHistory: false // User must opt in.
  }
}

/**
 * This screen handles creating/updating OTP user account settings.
 */
class UserAccountScreen extends Component {
  static propTypes = {
    originalUrl: PropTypes.string
  }

  static defaultProps = {
    originalUrl: '/'
  }

  constructor (props) {
    super(props)

    this.state = {
      activePaneId: 'terms',
      isNewAccount: true,
      userData: null
    }
  }

  _fetchUserData = async () => {
    const {
      auth,
      originalUrl,
      persistence,
      skipIfExistingUser
    } = this.props

    try {
      const result = await fetchUser(
        persistence.otp_middleware,
        'auth0UserId',
        auth.user.sub,
        auth.accessToken
      )

      /**
       * Beware! On AWS, for a nonexistent user, the call above will return, for example:
       * {
       *    status: 'success',
       *    data: {
       *      "result": "ERR",
       *      "message": "No user with auth0UserId=000000 found.",
       *      "code": 404,
       *      "detail": null
       *    }
       * }
       *
       * On direct middleware interface, for a nonexistent user, the call above will return:
       * {
       *    status: 'error',
       *    message: 'Error get-ing user...'
       * }
       * TODO: Improve AWS response.
       */
      const isNewAccount = result.status === 'error' || (result.data && result.data.result === 'ERR')

      if (!isNewAccount && skipIfExistingUser) {
        // Return to originalUrl and prevent the URL from showing in browsing history
        window.location.replace(window.location.href.replace('#/account/welcome', `#${originalUrl}`))
      } else {
        // TODO: Set application state (so that user data is fetched once only... until logout happens).
        const userData = isNewAccount ? getStateForNewUser(auth.user) : result.data
        if (userData.savedLocations === null) userData.savedLocations = []

        this.setState({
          isNewAccount,
          userData
        })
      }
    } catch (error) {
      // TODO: improve error handling.
      alert(`An error was encountered:\n${error}`)
    }
  }

  _updateUserState = newUserData => {
    const { userData } = this.state
    this.setState({
      userData: {
        ...userData,
        ...newUserData
      }
    })
  }

  _updateUserPrefs = async () => {
    const { auth, persistence } = this.props

    if (persistence && persistence.otp_middleware) {
      const { accessToken } = auth
      const { isNewAccount, userData } = this.state

      // TODO: Change state of Save button.

      let result
      if (isNewAccount) {
        result = await addUser(persistence.otp_middleware, accessToken, userData)
      } else {
        result = await updateUser(persistence.otp_middleware, accessToken, userData)
      }

      // TODO: improve this.
      if (result.status === 'success') {
        alert('Your preferences have been saved.')
      } else {
        alert(`An error was encountered:\n${result.message}`)
      }
    }
  }

  _handleExit = () => {
    const { originalUrl } = this.props
    this.props.routeTo(originalUrl)
  }

  _handleExitAndSave = async () => {
    await this._updateUserPrefs()
    this._handleExit()
  }

  _handleUserStateChange = memoize(
    propName => value => {
      const newPartialState = {}
      newPartialState[propName] = value
      this._updateUserState(newPartialState)
    }
  )

  _handleToNextPane = memoize(
    panes => async () => {
      const { activePaneId } = this.state
      const nextId = panes[activePaneId].nextId

      if (nextId) {
        this.setState({
          activePaneId: nextId
        })
      } else {
        await this._handleExitAndSave()
      }
    }
  )

  _handleToPrevPane = memoize(
    panes => () => {
      const { activePaneId } = this.state
      this.setState({
        activePaneId: panes[activePaneId].prevId
      })
    }
  )

  _makePanes = () => {
    const {
      isNewAccount,
      userData
    } = this.state

    const {
      hasConsentedToTerms,
      notificationChannel = 'email',
      phoneNumber,
      savedLocations,
      storeTripHistory
    } = userData

    const terms = (
      <TermsOfUsePane
        checkHistory={storeTripHistory}
        checkTerms={hasConsentedToTerms}
        disableCheckTerms={!isNewAccount}
        onCheckHistoryChange={this._handleUserStateChange('storeTripHistory')}
        onCheckTermsChange={this._handleUserStateChange('hasConsentedToTerms')}
      />
    )

    const notifications = (
      <NotificationPrefsPane
        email={userData.email}
        notificationChannel={notificationChannel}
        onNotificationChannelChange={this._handleUserStateChange('notificationChannel')}
        onPhoneNumberChange={this._handleUserStateChange('phoneNumber')}
        phoneNumber={phoneNumber}
      />
    )

    const locations = (
      <FavoriteLocationsPane
        locations={savedLocations}
        onLocationsChange={this._handleUserStateChange('savedLocations')}
      />
    )

    return {
      terms,
      notifications,
      verifyPhone: phoneVerificationPane,
      locations,
      finish: accountSetupFinishPane
    }
  }

  _renderNewAccount = () => {
    const {
      activePaneId,
      userData
    } = this.state

    const {
      hasConsentedToTerms,
      notificationChannel = 'email'
    } = userData

    const panes = this._makePanes()

    const paneSequence = {
      terms: {
        disableNext: !hasConsentedToTerms,
        nextId: 'notifications',
        pane: panes.terms,
        title: 'Create a new account'
      },
      notifications: {
        nextId: notificationChannel === 'sms' ? 'verifyPhone' : 'places',
        pane: panes.notifications,
        prevId: 'terms',
        title: 'Notification preferences'
      },
      verifyPhone: {
        disableNext: true,
        nextId: 'places',
        pane: panes.verifyPhone,
        prevId: 'notifications',
        title: 'Verify your phone'
      },
      places: {
        nextId: 'finish',
        pane: panes.locations,
        prevId: 'notifications',
        title: 'Add your locations'
      },
      finish: {
        pane: panes.finish,
        prevId: 'places',
        title: 'Account setup complete!'
      }
    }
    const activePane = paneSequence[activePaneId]

    return (
      <>
        <h1>{activePane.title}</h1>
        <div style={{minHeight: '20em'}}>
          {activePane.pane}
        </div>

        <AccountCommands
          backButton={activePane.prevId && {
            onClick: this._handleToPrevPane(paneSequence),
            text: 'Back'
          }}
          okayButton={{
            disabled: activePane.disableNext,
            onClick: this._handleToNextPane(paneSequence),
            text: activePane.nextId ? 'Next' : 'Finish'
          }}
        />
      </>
    )
  }

  _renderExistingAccount = () => {
    const panes = this._makePanes()

    const paneSequence = [
      {
        pane: panes.terms,
        title: 'Terms'
      },
      {
        pane: panes.notifications,
        title: 'Notifications'
      },
      {
        pane: panes.locations,
        title: 'My locations'
      }
    ]

    return (
      <>
        <h1>My Account</h1>
        {
          paneSequence.map((pane, index) => (
            <div key={index} style={{borderBottom: '1px solid #c0c0c0'}}>
              <h3 style={{marginTop: '0.5em'}}>{pane.title}</h3>
              <div style={{marginLeft: '10%'}}>
                {pane.pane}
              </div>
            </div>
          ))
        }

        <AccountCommands
          backButton={{
            onClick: this._handleExit,
            text: 'Back'
          }}
          okayButton={{
            onClick: this._handleExitAndSave,
            text: 'Save Preferences'
          }}
        />
      </>
    )
  }

  async componentDidMount () {
    await this._fetchUserData()

    // TODO: Update title bar.
  }

  render () {
    const { auth, otpConfig } = this.props
    const { user } = auth
    const { branding } = otpConfig
    const {
      isNewAccount,
      userData
    } = this.state

    if (!userData) {
      // Display a hint while fetching user data (from componentDidMount).
      return awaitingScreen
    }

    // TODO: Refactor header (was copied from trimet-mod-otp main.js),
    // and implement mobile view.
    const navBar = (
      <Navbar fluid inverse>
        <Navbar.Header>
          <Navbar.Brand>
            <div className='app-menu-container'>
              <AppMenu />
            </div>
            <div
              className={`icon-${branding}`}
              // This style is applied here because it is only intended for
              // desktop view.
              style={{ marginLeft: 50 }} />
          </Navbar.Brand>
        </Navbar.Header>
      </Navbar>
    )

    return (
      <div className='otp'>
        {navBar}
        <form className='container'>
          {(isNewAccount && !user.email_verified)
            // Check and prompt for email verification first to avoid extra user wait.
            ? verifyEmailScreen
            : (isNewAccount ? this._renderNewAccount() : this._renderExistingAccount())
          }
        </form>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    otpConfig: state.otp.config,
    persistence: state.otp.config.persistence
  }
}

const mapDispatchToProps = {
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen)
