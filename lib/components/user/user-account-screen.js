import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  Alert,
  Button,
  ButtonToolbar,
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  InputGroup,
  Nav,
  NavItem,
  Row,
  Tab,
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
      isNewAccount: true,
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

  _handleNewLocationChange = e => {
    const { userData } = this.state
    this.setState({
      userData: {
        ...userData,
        newLocationAddress: e.target.value
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
    const { isNewAccount, newLocationAddress, userData } = this.state

    // console.log(auth.accessToken)

    if (isNewAccount && !user.email_verified) {
      // Check email verification status first, so we can 
      // display the verification prompt without making the user wait.
      return <VerifyEmailScreen />
    }
    if (!auth.accessToken || !userData) {
      // Display a processing hint
      // while attempting to fetch user data (from componentDidMount).
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
        <h1>Create new account</h1>
        <p>You must agree to the terms of service to continue.</p>

        <FormGroup>
          <Checkbox checked={hasConsentedToTerms} onChange={this._handleConsentChange}>
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
        <h1>
          Notification preferences
        </h1>
        <p>
          You can receive notifications about trips you frequently take.
          How would you like to receive notifications?
        </p>
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

        {notificationChannel === 'sms' && (
          <FormGroup>
            <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
            <FormControl onChange={this._handlePhoneNumberChange} type='tel' value={phoneNumber} />
          </FormGroup>
        )}
      </div>
    )

    const phoneVerificationPane = (
      <div>
        <Alert bsStyle='warning'>
          <strong>Under construction!</strong>
        </Alert>
        <h1>
          Verify your phone number
        </h1>
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

    const placesPane = (
      <div>
        <h1>
          Add your places
        </h1>
        <p>
          Save time planning trips by adding the places you frequent the most:
        </p>

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
            <InputGroup.Addon style={{minWidth: '40px'}}>
              <FontAwesome name='plus' />
            </InputGroup.Addon>
            <FormControl
              onBlur={this._handleAddNewLocation}
              onChange={this._handleNewLocationChange}
              placeholder='Add another place'
              type='text' value={newLocationAddress}
            />
          </InputGroup>
        </FormGroup>
      </div>
    )

    return (
      <div>
        <h1>
          {isNewAccount ? `Welcome, ${user.nickname}!` : `Hello, ${user.nickname}!`}
        </h1>
        <form>
          {termsOfUsePane}
          <hr />
          {notificationPrefsPane}
          <hr />
          {phoneVerificationPane}
          <hr />
          {placesPane}
        </form>

{/*
        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
          <Row className="clearfix">
            <Col sm={4}>
              <Nav bsStyle="pills" stacked>
                <NavItem eventKey="first">Tab 1</NavItem>
                <NavItem eventKey="second">Tab 2</NavItem>
              </Nav>
            </Col>
            <Col sm={8}>
              <Tab.Content animation>
                <Tab.Pane eventKey="first">Tab 1 content</Tab.Pane>
                <Tab.Pane eventKey="second">Tab 2 content</Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
*/}
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
