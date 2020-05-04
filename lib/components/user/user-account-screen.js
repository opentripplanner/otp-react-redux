import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, ButtonGroup, ButtonToolbar, Col, ControlLabel, FormControl, FormGroup, Nav, NavItem, Radio, Row, Tab, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
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

        const result = await fetchUser(
          persistence.otp_middleware,
          'auth0UserId',
          auth.user.sub,
          auth.accessToken
        )
        const isNewAccount = result.status !== 'success'

        if (!isNewAccount && skipIfExistingUser) {
          this.props.routeTo(originalUrl)
        } else {
          this.setState({
            isNewAccount,
            userData: isNewAccount ? getStateForNewUser(auth.user) : result.data
          })
        }
      }
    }, 1000)
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
    const { isNewAccount, userData } = this.state

    // console.log(auth.accessToken)

    if (isNewAccount && !user.email_verified) {
      // Check email verified status first to display verification prompt
      // and avoid displaying a 'processing' hint.
      return <VerifyEmailScreen />
    }
    if (!auth.accessToken || !userData) {
      // Display a processing hint
      // while attempting to fetch user data.
      return <div>Processing...</div>
    }

    const { notificationChannel = null, phoneNumber = '' } = userData

    return (
      <div>
        <h1>
          {isNewAccount ? `Welcome, ${user.nickname}!` : `Hello, ${user.nickname}!`}
        </h1>

        {auth.accessToken && <p>Auth token is available.</p> }
        <form>
          <p>User data:</p>
          <ul>
            <li>ID: {user.sub}</li>
            <li>Name: {user.name}</li>
            <li>Nickname: {user.nickname}</li>
            <li>Email: {user.email}</li>
          </ul>

          <p>
            Notification preferences
          </p>
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
            <div>
              <ControlLabel>Enter your phone number for SMS notifications:</ControlLabel>
              <FormControl onChange={this._handlePhoneNumberChange} type='tel' value={phoneNumber} />
            </div>
          )}

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
