import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Navbar } from 'react-bootstrap'
import { connect } from 'react-redux'

import { addUser, fetchUser, updateUser } from '../../util/middleware'
import { routeTo } from '../../actions/ui'
import AppMenu from '../app/app-menu'

import AccountCommands from './account-commands'
import AccountSetupFinishPane from './account-setup-finish-pane'
import AwaitingScreen from './awaiting-screen'
import FavoriteLocationsPane from './favorite-locations-pane'
import NotificationPrefsPane from './notification-prefs-pane'
import PhoneVerificationPane from './phone-verification-pane'
import TermsOfUsePane from './terms-of-use-pane'
import VerifyEmailScreen from './verify-email-screen'

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

// Helper filter functions.
const isHome = loc => loc.type === 'home'
const isWork = loc => loc.type === 'work'
const notHomeOrWork = loc => loc.type !== 'home' && loc.type !== 'work'

/**
 * Build an 'effective' list of locations from the savedLocations list for display.
 */
function getEffectiveLocations (savedLocations) {
  // In theory there could be multiple home or work locations.
  // Just pick the first one.
  const homeLocation = savedLocations.find(isHome) || {
    address: null,
    icon: 'home',
    type: 'home'
  }
  const workLocation = savedLocations.find(isWork) || {
    address: null,
    icon: 'briefcase',
    type: 'work'
  }

  return [
    homeLocation,
    workLocation,
    ...savedLocations.filter(notHomeOrWork)
  ]
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

  _handleAddNewLocation = e => {
    const value = e.target.value || ''
    if (value.trim().length > 0) {
      const { userData } = this.state
      const { savedLocations } = userData

      // Create a new array for savedLocations.
      const newSavedLocations = [].concat(savedLocations)

      newSavedLocations.push({
        address: value.trim(),
        icon: 'map-marker',
        type: 'custom'
      })

      // Event onChange will trigger after this and before rerender,
      // so ***DO*** empty the input box value so the user can enter their next location.
      e.target.value = null

      this._updateUserState({ savedLocations: newSavedLocations })
    }
  }

  _handleAddressChange = (location, e) => {
    const value = e.target.value
    const isValueEmpty = !value || value === ''
    const nonEmptyLocation = isValueEmpty ? null : location
    const { userData } = this.state
    const { savedLocations } = userData

    // Update location address, ohterwise it stalls the input box.
    location.address = value

    // Create a new array for savedLocations.
    let newSavedLocations = []

    // Add home/work as first entries to the new state only if
    // - user edited home/work to non-empty, or
    // - user edited another location and home/work is in savedLocations.
    const homeLocation = (isHome(location) && nonEmptyLocation) || savedLocations.find(isHome)
    if (homeLocation) newSavedLocations.push(homeLocation)

    const workLocation = (isWork(location) && nonEmptyLocation) || savedLocations.find(isWork)
    if (workLocation) newSavedLocations.push(workLocation)

    // Add the rest if it is not home or work
    // and if the new address of this one is not null or empty.
    newSavedLocations = newSavedLocations.concat(savedLocations
      .filter(notHomeOrWork)
      .filter(loc => loc !== location || !isValueEmpty)
    )

    this._updateUserState({ savedLocations: newSavedLocations })
  }

  _handleConsentChange = e => {
    this._updateUserState({ hasConsentedToTerms: e.target.checked })
  }

  _handleExit = () => {
    const { originalUrl } = this.props
    this.props.routeTo(originalUrl)
  }

  _handleExitAndSave = async () => {
    await this._updateUserPrefs()
    this._handleExit()
  }

  _handleNotificationChannelChange = e => {
    this._updateUserState({ notificationChannel: e })
  }

  _handleToNextPane = async panes => {
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

  _handlePhoneNumberChange = e => {
    this._updateUserState({ phoneNumber: e.target.value })
  }

  _handleStoreTripsChange = e => {
    this._updateUserState({ storeTripHistory: e.target.checked })
  }

  _handleToPrevPane = panes => {
    const { activePaneId } = this.state
    this.setState({
      activePaneId: panes[activePaneId].prevId
    })
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
      activePaneId,
      isNewAccount,
      userData
    } = this.state

    if (isNewAccount && !user.email_verified) {
      // Check and prompt for email verification first to avoid extra user wait.
      return <VerifyEmailScreen />
    }

    if (!userData) {
      // Display a hint while fetching user data (from componentDidMount).
      return <AwaitingScreen />
    }

    const {
      hasConsentedToTerms,
      notificationChannel = 'email',
      phoneNumber,
      savedLocations,
      storeTripHistory
    } = userData

    const termsOfUsePane = (
      <TermsOfUsePane
        checkHistory={storeTripHistory}
        checkTerms={hasConsentedToTerms}
        disableCheckTerms={!isNewAccount}
        onCheckHistoryChange={this._handleStoreTripsChange}
        onCheckTermsChange={this._handleConsentChange}
      />
    )

    const notificationPrefsPane = (
      <NotificationPrefsPane
        email={userData.email}
        notificationChannel={notificationChannel}
        onNotificationChannelChange={this._handleNotificationChannelChange}
        onPhoneNumberChange={this._handlePhoneNumberChange}
        phoneNumber={phoneNumber}
      />
    )

    const phoneVerificationPane = <PhoneVerificationPane />

    const placesPane = (
      <FavoriteLocationsPane
        onAddPlace={this._handleAddNewLocation}
        onEditPlaceAddress={this._handleAddressChange}
        places={getEffectiveLocations(savedLocations)}
      />
    )

    const finishPane = <AccountSetupFinishPane />

    const panesForNewAccount = {
      terms: {
        disableNext: !hasConsentedToTerms,
        nextId: 'notifications',
        pane: termsOfUsePane,
        title: 'Create a new account'
      },
      notifications: {
        nextId: notificationChannel === 'sms' ? 'verifyPhone' : 'places',
        pane: notificationPrefsPane,
        prevId: 'terms',
        title: 'Notification preferences'
      },
      verifyPhone: {
        disableNext: true,
        nextId: 'places',
        pane: phoneVerificationPane,
        prevId: 'notifications',
        title: 'Verify your phone'
      },
      places: {
        nextId: 'finish',
        pane: placesPane,
        prevId: 'notifications',
        title: 'Add your locations'
      },
      finish: {
        pane: finishPane,
        prevId: 'places',
        title: 'Account setup complete!'
      }
    }
    const activePane = panesForNewAccount[activePaneId]

    const panesForExistingAccount = [
      {
        pane: termsOfUsePane,
        title: 'Terms'
      },
      {
        pane: notificationPrefsPane,
        title: 'Notifications'
      },
      {
        pane: placesPane,
        title: 'My locations'
      }
    ]

    return (
      // TODO: Refactor header (was copied from example.js), and implement mobile view.
      <div class='otp'>
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

        <form>

          {isNewAccount
            ? (
              <div class='container'>
                <h1>{activePane.title}</h1>
                <div style={{minHeight: '20em'}}>
                  {activePane.pane}
                </div>

                <AccountCommands
                  backButton={activePane.prevId && {
                    onClick: () => this._handleToPrevPane(panesForNewAccount),
                    text: 'Back'
                  }}
                  okayButton={{
                    disabled: activePane.disableNext,
                    onClick: () => this._handleToNextPane(panesForNewAccount),
                    text: activePane.nextId ? 'Next' : 'Finish'
                  }}
                />
              </div>
            )
            : (
              <div class='container'>
                <h1>My Account</h1>
                {
                  panesForExistingAccount.map((pane, index) => (
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
              </div>
            )
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
