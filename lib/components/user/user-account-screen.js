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
  Navbar,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { addUser, fetchUser, updateUser } from '../../util/middleware'
import { routeTo } from '../../actions/ui'

import AppMenu from '../app/app-menu'
import AwaitingScreen from './awaiting-screen'
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

const allowedNotificationChannels = [
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

const fancyAddLocationCss = `
  background-color: #337ab7;
  color: #fff;
`
const StyledAddon = styled(InputGroup.Addon)`
  min-width: 40px;
`
const NewPlaceAddon = styled(StyledAddon)`
  ${fancyAddLocationCss}
`
const NewPlaceFormControl = styled(FormControl)`
  ${fancyAddLocationCss}
  ::placeholder {
    color: #fff;
  }
  &:focus {
    background-color: unset;
    color: unset;
    ::placeholder {
      color: unset;
    }
  }
`

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
        if (userData.savedLocations === null) userData.savedLocatons = []

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
      // so DO empty the input box value so the user can enter their next location.
      e.target.value = null

      this._updateUserState({ savedLocations: newSavedLocations })
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
      <div>
        <p>You must agree to the terms of service to continue.</p>

        <FormGroup>
          <Checkbox
            checked={hasConsentedToTerms}
            disabled={!isNewAccount}
            onChange={isNewAccount ? this._handleConsentChange : null}
          >
            I have read and consent to the <a href='/#/terms-of-service'>Terms of Service</a> for using the Trip Planner.
          </Checkbox>
        </FormGroup>

        <FormGroup>
          <Checkbox
            checked={storeTripHistory}
            onChange={this._handleStoreTripsChange}
          >
            Optional: I consent to the Trip Planner storing my historical planned trips in order to
            improve transit services in my area. <a href='/#/terms-of-storage'>More info...</a>
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
              name='notificationChannels'
              onChange={this._handleNotificationChannelChange}
              type='radio'
              value={notificationChannel}
            >
              {allowedNotificationChannels.map(({ type, text }, index) => (
                <ToggleButton
                  bsStyle={notificationChannel === type ? 'primary' : 'default'}
                  key={index}
                  value={type}
                >
                  {text}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </ButtonToolbar>
        </FormGroup>
        <div
          style={{height: '150px'}} // preserve height of pane.
        >
          {notificationChannel === 'email' && (
            <FormGroup>
              <ControlLabel>Notification emails will be sent out to:</ControlLabel>
              <FormControl disabled type='text' value={userData.email} />
            </FormGroup>
          )}
          {notificationChannel === 'sms' && (
            <FormGroup>
              <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
              <FormControl onChange={this._handlePhoneNumberChange} type='tel' value={phoneNumber} />
            </FormGroup>
          )}
        </div>
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
      workLocation,
      ...savedLocations.filter(loc => loc.type !== 'home' && loc.type !== 'work')
    ]

    const placesPane = (
      <div>
        <ControlLabel>Add the places you frequent often to save time planning trips:</ControlLabel>

        {effectiveLocations.map((loc, index) => (
          <FormGroup key={index}>
            <InputGroup>
              <StyledAddon title={loc.type}>
                <FontAwesome name={loc.icon} />
              </StyledAddon>
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
            <NewPlaceAddon>
              <FontAwesome name='plus' />
            </NewPlaceAddon>
            <NewPlaceFormControl
              onBlur={this._handleAddNewLocation}
              placeholder='Add another place'
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
      terms: { title: 'Create a new account', pane: termsOfUsePane, nextId: 'notifications', disableNext: !hasConsentedToTerms },
      notifications: { title: 'Notification preferences', pane: notificationPrefsPane, nextId: notificationChannel === 'sms' ? 'verifyPhone' : 'places', prevId: 'terms' },
      verifyPhone: { title: 'Verify your phone', pane: phoneVerificationPane, nextId: 'places', prevId: 'notifications', disableNext: true },
      places: { title: 'Add your locations', pane: placesPane, nextId: 'finish', prevId: 'notifications' },
      finish: { title: 'Account setup complete!', pane: finishPane, prevId: 'places' }
    }
    const realActivePane = panesForNewAccount[activePaneId]

    const panesForExistingAccount = [
      {title: 'Terms', pane: termsOfUsePane},
      {title: 'Notifications', pane: notificationPrefsPane},
      {title: 'My locations', pane: placesPane}
    ]

    const {branding} = otpConfig

    return (
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
                <h1>{realActivePane.title}</h1>
                <div style={{minHeight: '20em'}}>
                  {realActivePane.pane}
                </div>

                <FormGroup style={{padding: '20px 0px'}}>
                  <nav aria-label='...'>
                    {realActivePane.prevId &&
                    <Button
                      onClick={() => this._handleToPrevPane(panesForNewAccount)}
                      style={{float: 'left'}}
                    >
                      Back
                    </Button>
                    }
                    <Button
                      bsStyle='primary'
                      disabled={realActivePane.disableNext}
                      onClick={() => this._handleToNextPane(panesForNewAccount)}
                      style={{float: 'right'}}
                    >
                      {realActivePane.nextId ? 'Next' : 'Finish'}
                    </Button>
                  </nav>
                </FormGroup>
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

                <FormGroup style={{padding: '20px 0px'}}>
                  <nav aria-label='...'>
                    <Button
                      onClick={this._handleExit}
                      style={{float: 'left'}}
                    >
                      Back
                    </Button>
                    <Button
                      bsStyle='primary'
                      onClick={this._handleExitAndSave}
                      style={{float: 'right'}}
                    >
                      Save Preferences
                    </Button>
                  </nav>
                </FormGroup>
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
