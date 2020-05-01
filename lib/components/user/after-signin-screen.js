import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'

import { routeTo } from '../../actions/ui'

class AfterSignIn extends Component {
  static propTypes = {
  }

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  /*
  componentDidMount () {
    const { location, parseUrlQueryString } = this.props

    // Parse the URL query parameters, if present
    if (location && location.search) {
      parseUrlQueryString()
    }
  }
  */

  handleNewUser = () => {
    this.props.routeTo('/account/new')
  }

  handleExistingUser = () => {

  }

  render () {
    // const { config, customIcons, itinerary } = this.props
    return (
      <div>
        <h1>Signed In...
          <br />
          <FontAwesome
            name='hourglass-half'
            size='4x'
          />
        </h1>

        {/**
         * TODO: In auth.js redirect callback, attempt to retrieve user data from OTP Middleware.
         * For now, just prompt whether user has account or not.
         */}

        <Button onClick={this.handleNewUser}>New User</Button>
        <Button onClick={this.handleExistingUser}>Existing User</Button>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = {
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(AfterSignIn)
