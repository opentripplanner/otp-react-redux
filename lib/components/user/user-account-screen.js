import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Col, Nav, NavItem, Row, Tab } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import { withAuth, withLoginRequired } from 'use-auth0-hooks'

import otpConfig from '../../../config.yml'
import { AUTH0_SCOPE } from '../../util/constants'

import { routeTo } from '../../actions/ui'

class UserAccountScreen extends Component {
  static propTypes = {
    isNewAccount: PropTypes.bool,
    originalUrl: PropTypes.string
  }

  static defaultProps = {
    isNewAccount: false,
    originalUrl: '/'
  }

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  // componentDidMount () {
    // const { location, parseUrlQueryString } = this.props

    // Parse the URL query parameters, if present
    // if (location && location.search) {
    //  parseUrlQueryString()
    // }
    // document.title = `My Account`
  // }

  _updateUserPrefs = async () => {
    const { auth, isNewAccount, persistence } = this.props

    if (persistence && persistence.otp_middleware) {
      const { apiBaseUrl, apiKey } = persistence.otp_middleware
      const apiUserPath = '/api/secure/user'
      const requestUrl = `${apiBaseUrl}${apiUserPath}`
      const { accessToken, user } = auth

      const requestData = {
        email: user.email,
        auth0UserId: auth.sub,
        phoneNumber: '404-894-2000'
      }

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

      alert('Your preferences have been saved.')
    }
  }

  render () {
    const { auth, isNewAccount, originalUrl } = this.props

    // console.log(auth.accessToken)

    return (
      <div>
        <h1>
          {isNewAccount ? 'Welcome New User!' : 'Welcome Back!'}
        </h1>

        <p>User data:</p>
        <ul>
          <li>ID: {auth.user.sub}</li>
          <li>Name: {auth.user.name}</li>
          <li>Nickname: {auth.user.nickname}</li>
          <li>email: {auth.user.email}</li>

        </ul>


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

const { auth0 } = otpConfig.persistence

// TODO: Separate Auth from UI.
export default withLoginRequired(
  withAuth(
    connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen),
    {
      audience: auth0.audience,
      scope: AUTH0_SCOPE
    }
  )
)
