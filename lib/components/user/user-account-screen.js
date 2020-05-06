import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  Alert,
  Button,
  ButtonToolbar,
  Checkbox,
  ControlLabel,
  FormControl,
  FormGroup,
  InputGroup,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import { withAuth, withLoginRequired } from 'use-auth0-hooks'

import otpConfig from '../../../config.yml'
import { AUTH0_SCOPE } from '../../util/constants'
import { addUser, fetchUser, updateUser } from '../../util/middleware'
import { routeTo } from '../../actions/ui'

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

const notificationChannels = [
  {
    type: 'email',
    text: 'Email'
  },
  {
    type: 'sms',
    text: 'SMS'
  },
  {
    type: 'none',
    text: 'Don\'t notify me'
  }
]

const addLocationInputStyle = {
  backgroundColor: '#337ab7',
  color: '#fff'
}

/**
 * This screen handles creating/updating OTP user accoun settings.
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
      isNewLocationFocused: false,
      newLocationAddress: null,
      userData: null
    }
  }

  _fetchUserData = async () => {    
    // Set up timer to poll for an accessToken every second until one is available.
    // Then only, attempt to get user account.
    // (An accessToken is required to query the middleware API.)
    this._tokenTimer = setInterval(async () => {
      const {
        auth,
        originalUrl,
        persistence,
        skipIfExistingUser
      } = this.props
      if (auth.accessToken) {
        clearInterval(this._tokenTimer)

        try {
          const result = await fetchUser(
            persistence.otp_middleware,
            'auth0UserId',
            auth.user.sub,
            auth.accessToken
          )
          const isNewAccount = result.status !== 'success'

          if (!isNewAccount && skipIfExistingUser) {
            // Return to originalUrl and prevent the URL from showing in browsing history
            window.location.replace(window.location.href.replace('#/account/welcome', `#${originalUrl}`))
          } else {
            // TODO: Set application state (so that user data is fetched once only... until logout happens).
            this.setState({
              isNewAccount,
              userData: isNewAccount ? getStateForNewUser(auth.user) : result.data
            })
          }  
        } catch (error) {
          // TODO: improve error handling.
          alert(`An error was encountered:\n${error}`)
        }
      }
    }, 1000)
  }

  _handleAddNewLocationFocus = focused => {
    this.setState({
      isNewLocationFocused: focused
    })
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
      // so DO empty the input box value so the user can enter their next location.
      e.target.value = null

      this.setState({
        userData: {
          ...userData,
          newLocationAddress: null,
          savedLocations: newSavedLocations
        }
      })
      this._handleAddNewLocationFocus(false)
    }
  }

  _handleAddressChange = (location, e) => {
    const value = e.target.value
    const isValueEmpty = !value || value === ''
    const { userData } = this.state
    const { savedLocations } = userData
    const { type } = location

    // Update location address
    location.address = value

    // Create a new array for savedLocations.
    let newSavedLocations = []

    // Add home/work as first entries to the new state only if
    // - user edited home/work to non-empty, or
    // - user edited another location and home/work is in savedLocations.
    const homeLocation = type === 'home'
      ? (isValueEmpty ? null : location)
      : savedLocations.find(loc => loc.type === 'home')
    if (homeLocation) newSavedLocations.push(homeLocation)

    const workLocation = type === 'work'
      ? (isValueEmpty ? null : location)
      : savedLocations.find(loc => loc.type === 'work')
    if (workLocation) newSavedLocations.push(workLocation)

    // Add the rest if it is not home or work
    // and if the new address of this one is not null or empty.
    newSavedLocations = newSavedLocations.concat(
      savedLocations.filter(loc => (
        loc.type !== 'home' && loc.type !== 'work' &&
        (loc !== location || !isValueEmpty)
      ))
    )

    this.setState({
      userData: {
        ...userData,
        savedLocations: newSavedLocations
      }
    })
  }

  _handleConsentChange = e => {
    const { userData } = this.state
    this.setState({
      userData: {
        ...userData,
        hasConsentedToTerms: e.target.checked
      }
    })
  }

  _handlePhoneNumberChange = e => {
    const { userData } = this.state
    this.setState({
      userData: {
        ...userData,
        phoneNumber: e.target.value
      }
    })
  }

  _handleStoreTripsChange = e => {
    const { userData } = this.state
    this.setState({
      userData: {
        ...userData,
        storeTripHistory: e.target.checked
      }
    })
  }

  _handleNotificationChannelChange = e => {
    const { userData } = this.state
    this.setState({
      userData: {
        ...userData,
        notificationChannel: e
      }
    })
  }

  _handleToNextPane = panes => {
    const { activePaneId } = this.state
    this.setState({
      activePaneId: panes[activePaneId].nextId
    })
  }

  _handleToPrevPane = panes => {
    const { activePaneId } = this.state
    this.setState({
      activePaneId: panes[activePaneId].prevId
    })
  }

  _updateUserData = newUserData => {

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

  async componentDidMount () {
    await this._fetchUserData()

    // TODO: Update title bar.
  }

  render () {
    const { auth, originalUrl } = this.props
    const { user } = auth
    const {
      activePaneId,
      isNewAccount,
      isNewLocationFocused,
      userData
    } = this.state

    // console.log(auth.accessToken)

    if (isNewAccount && !user.email_verified) {
      // Check and prompt for email verification first to avoid extra user wait.
      return <VerifyEmailScreen />
    }
    if (!auth.accessToken || !userData) {
      // Display a hint while fetching user data (from componentDidMount).
      return <div>Processing...</div>
    }

    const {
      hasConsentedToTerms,
      notificationChannel,
      phoneNumber,
      savedLocations,
      storeTripHistory
    } = userData

    const termsOfUsePane = (
      <div>
        <p>You must agree to the terms of service to continue.</p>

        <FormGroup>
          <Checkbox checked={hasConsentedToTerms} onChange={isNewAccount ? this._handleConsentChange : null} readOnly={!isNewAccount}>
            I have read and consent to the <a href="/#/terms-of-service">Terms of Service</a> for using the Trip Planner.
          </Checkbox>
        </FormGroup>

        <FormGroup>
          <Checkbox checked={storeTripHistory} onChange={this._handleStoreTripsChange}>
            Optional: I consent to the Trip Planner storing my historical planned trips in order to
            improve transit services in my area. <a href="/#/terms-of-storage">More info...</a>
          </Checkbox>
        </FormGroup>
      </div>
    )

    const notificationPrefsPane = (
      <div>
        <p>
          You can receive notifications about trips you frequently take.
        </p>
        <FormGroup>
          <ControlLabel>How would you like to receive notifications?</ControlLabel>
          <ButtonToolbar>
            <ToggleButtonGroup
              name='notificationChannel'
              onChange={this._handleNotificationChannelChange}
              type='radio'
              value={notificationChannel}
            >
              {notificationChannels.map(({ type, text }, index) => (
                <ToggleButton
                  bsStyle={type === notificationChannel ? 'primary' : 'default'}
                  key={index}
                  value={type}
                >
                  {text}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </ButtonToolbar>
        </FormGroup>
        <FormGroup
          // If SMS is not selected, render has hidden to preserve the height of the panel.
          style={notificationChannel !== 'sms' ? {visibility: 'hidden'} : {}}
        >
          <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
          <FormControl onChange={this._handlePhoneNumberChange} type='tel' value={phoneNumber} />
        </FormGroup>
      </div>
    )

    const phoneVerificationPane = (
      <div>
        <Alert bsStyle='warning'>
          <strong>Under construction!</strong>
        </Alert>
        <p>
          Please check your mobile phone's SMS messaging app for a text
          message with a verification code and copy the code below:
        </p>
        <FormGroup bsSize='large'>
          <FormControl type='number' placeholder='_ _ _ _ _ _' />
        </FormGroup>
      </div>
    )

    // In theory there could be multiple home or work locations.
    // Just pick the first one,
    const homeLocation = savedLocations.find(loc => loc.type === 'home') || {
      address: null,
      icon: 'home',
      type: 'home'
    }
    const workLocation = savedLocations.find(loc => loc.type === 'work') || {
      address: null,
      icon: 'briefcase',
      type: 'work'
    }

    // Build an 'effective' locations list for display.
    const effectiveLocations = [
      homeLocation,
      workLocation
    ].concat(
      savedLocations.filter(loc => loc.type !== 'home' && loc.type !== 'work')
    )

    const newLocationStyle = isNewLocationFocused ? {} : addLocationInputStyle
    const placesPane = (
      <div>
        <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

        {effectiveLocations.map((loc, index) => (
          <FormGroup key={index}>
            <InputGroup>
              <InputGroup.Addon style={{minWidth: '40px'}}>
                <FontAwesome name={loc.icon} />
              </InputGroup.Addon>
              <FormControl
                onChange={e => this._handleAddressChange(loc, e)}
                placeholder={`Add ${loc.type}`}
                type='text'
                value={loc.address} />
            </InputGroup>
          </FormGroup>
        ))}

        {/* For adding a location. */}
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon style={{minWidth: '40px', ...newLocationStyle}}>
              <FontAwesome name='plus' />
            </InputGroup.Addon>
            <FormControl
              onBlur={this._handleAddNewLocation}
              onFocus={() => this._handleAddNewLocationFocus(true)}
              placeholder='Add another place'
              style={newLocationStyle}
              type='text'
            />
          </InputGroup>
        </FormGroup>
      </div>
    )

    const finishPane = (
      <div>
        <p>You are ready to start planning your trips.</p>
      </div>
    )

    const panesForNewAccount = {
      terms: { title: 'Create a new account', pane: termsOfUsePane, nextId: 'notifications' },
      notifications: { title: 'Notification preferences', pane: notificationPrefsPane, nextId: notificationChannel === 'sms' ? 'verifyPhone' : 'places', prevId: 'terms' },
      verifyPhone: { title: 'Verify your phone', pane: phoneVerificationPane, nextId: 'places', prevId: 'notifications' },
      places: { title: 'Add your locations', pane: placesPane, nextId: 'finish', prevId: 'notifications' },
      finish: { title: 'Account setup complete', pane: finishPane, prevId: 'places' }
    }
    const realActivePane = panesForNewAccount[activePaneId]

    const panesForExistingAccount = [
      {title: 'Terms', pane: termsOfUsePane},
      {title: 'Notifications', pane: notificationPrefsPane},
      {title: 'My locations', pane: placesPane}
    ]

    return (
      <form>
        {isNewAccount
          ? (
            <div>
              <h1>{realActivePane.title}</h1>
              <div style={{minHeight: '20em'}}>
                {realActivePane.pane}
              </div>

              <nav aria-label="...">
                {realActivePane.prevId &&
                    <Button
                      onClick={() => this._handleToPrevPane(panesForNewAccount)} style={{border: 'none'}}
                      style={{float: 'left'}}
                    >
                      Back
                    </Button>
                }
                <Button
                  bsStyle='primary'
                  onClick={() => this._handleToNextPane(panesForNewAccount)} style={{border: 'none'}}
                  style={{float: 'right'}}
                >
                  {realActivePane.nextId ? 'Next' : 'Finish'}
                </Button>
              </nav>
            </div>
          )
          : (
            <div>
              <h1>My Account</h1>
              {
                panesForExistingAccount.map((pane, index) => (
                  <div key={index} style={{borderTop: '1px solid #c0c0c0'}}>
                    <h3 style={{marginTop: '0.5em'}}>{pane.title}</h3>
                    <div style={{marginLeft: '20%'}}>
                      {pane.pane}
                    </div>
                  </div>
                ))
              }

              <p>
                <Button onClick={() => this.props.routeTo(originalUrl)}>
                  Back to Trip Planner
                </Button>
                <Button onClick={this._updateUserPrefs}>
                  Save Preferences
                </Button>
              </p>
            </div>
          )
        }
      </form>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    persistence: state.otp.config.persistence
  }
}

const mapDispatchToProps = {
  routeTo
}

// TODO: Separate Auth from UI.
const { auth0 } = otpConfig.persistence

export default withLoginRequired(
  withAuth(
    connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen),
    {
      audience: auth0.audience,
      scope: AUTH0_SCOPE
    }
  )
)
