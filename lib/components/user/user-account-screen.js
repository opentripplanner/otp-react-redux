import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, ButtonGroup, ButtonToolbar, Col, ControlLabel, FormControl, FormGroup, Nav, NavItem, Radio, Row, Tab, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import { useAccessToken, useAuth, withAuth, withLoginRequired } from 'use-auth0-hooks'

import otpConfig from '../../../config.yml'
import { AUTH0_SCOPE } from '../../util/constants'
import { fetchUser } from '../../util/middleware'

import { routeTo } from '../../actions/ui'

import VerifyEmailScreen from './verify-email-screen'

const apiUserPath = '/api/secure/user'

function getStateForNewUser () {
  return {
    hasTermsOfServiceConsent: false, // User must opt in.
    notificationChannel: 'email',
    phoneNumber: '',
    recentLocations: [],
    savedLocations: [],
    storeTripHistory: false // User must opt in.
  }
}

/*
function getStateForExistingUser () {
  // TODO: fetch it.
  return {
    hasTermsOfServiceConsent: true,
    notificationChannel: 'none',
    phoneNumber: '678-258-1500',
    recentLocations: [
      {
        address: '9 N Hyer Ave, Orlando, FL'
      }
    ],
    savedLocations: [
      {
        address: '951 Leigh Ave, Orlando, FL',
        icon: 'home',
        type: 'home'
      },
      {
        address: '63 W Amelia St, Orlando, FL',
        icon: 'briefcase',
        type: 'work'
      }
    ],
    storeTripHistory: true
  }
}
*/

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
    originalUrl: PropTypes.string // TODO: user routeTo
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
    // Attempt to get user account.

    // set up timer to poll for token until a token is available.
    this._tokenTimer = setInterval(async () => {
      const { auth, persistence } = this.props
      if (auth.accessToken) {
        const user = await fetchUser(
          persistence.otp_middleware,
          'auth0UserId',
          auth.user.sub,
          auth.accessToken
        )
    
        const isNewAccount = user === null
    
        this.setState({
          isNewAccount,
          userData: isNewAccount ? getStateForNewUser() : user
        })
    
        clearInterval(this._tokenTimer)
      }      
    }, 1000) // defaults to every 30 sec. TODO: make this configurable?*/
    
    // if (!auth.accessToken) return

  }

  async componentDidMount () {
    await this._fetchUserData()

    // const { location, parseUrlQueryString } = this.props

    // Parse the URL query parameters, if present
    // if (location && location.search) {
    //  parseUrlQueryString()
    // }
    // document.title = `My Account`
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
      const { apiBaseUrl, apiKey } = persistence.otp_middleware
      const requestUrl = `${apiBaseUrl}${apiUserPath}`
      const { accessToken, user } = auth
      const { isNewAccount, userData } = this.state
      const { notificationChannel, phoneNumber } = userData

      const requestData = {
        email: user.email,
        isEmailVerified: user.email_verified,
        auth0UserId: user.sub,
        notificationChannel,
        phoneNumber
      }

      // TODO: Change state of Save button.

      await fetch(requestUrl, {
        method: isNewAccount ? 'POST' : 'PUT',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': apiKey
        },
        body: JSON.stringify(requestData)
      })

      // TODO: improve this.
      alert('Your preferences have been saved.')
    }
  }

  render () {
    const { auth, originalUrl } = this.props
    
    const { user } = auth
    const { isNewAccount, userData } = this.state

    if (!auth.accessToken || !userData) return <div>Processing...</div>

    const { notificationChannel = null, phoneNumber = '' } = userData || {}

    // console.log(auth.accessToken)

    if (isNewAccount && !user.email_verified) {
      return <VerifyEmailScreen />
    }
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
