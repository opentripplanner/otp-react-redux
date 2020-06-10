import React, { Component } from 'react'
import { connect } from 'react-redux'

import { routeTo } from '../../actions/ui'
import { ensureLoggedInUserIsFetched } from '../../actions/user'
import { renderChildrenWithProps } from '../../util/ui'

import AwaitingScreen from './awaiting-screen'

/**
 * This component
 * - ensures that values under state.otpUser are set when a user is logged in,
 * - if needed by the children, displays a wait screen while state.otpUser values are being fetched,
 * - renders children when state.otpUser values are available, or if no user is logged in or if auth is disabled.
 */
class UserLoaderScreen extends Component {
  componentDidMount () {
    const { auth, ensureLoggedInUserIsFetched } = this.props
    ensureLoggedInUserIsFetched(auth)
  }

  render () {
    const { auth, children, loggedInUser, requireLoggedInUser } = this.props

    if (auth) {
      if (requireLoggedInUser && auth.isAuthenticated && !loggedInUser) {
        // Display a hint while fetching user data for logged in user (from componentDidMount).
        // Don't display this if loggedInUser is already available.
        return <AwaitingScreen />
      } else {
        return renderChildrenWithProps(children, { auth })
      }
    }

    return children
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.otpUser.loggedInUser
  }
}

const mapDispatchToProps = {
  ensureLoggedInUserIsFetched,
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLoaderScreen)
