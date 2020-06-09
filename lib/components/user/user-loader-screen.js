import React, { Component } from 'react'
import { connect } from 'react-redux'

import { routeTo } from '../../actions/ui'
import { ensureLoggedInUserIsFetched } from '../../actions/user'
import { renderChildrenWithProps } from '../../util/ui'

import AwaitingScreen from './awaiting-screen'

/**
 * This component ensures that state.otp.user.loggedInUser is set when a user is logged in
 * (and renders a wait screen while this happens), before rendering children.
 * (If no user is logged in, or if auth is disabled, it just renders the children.)
 */
class UserLoaderScreen extends Component {
  componentDidMount () {
    const { auth, ensureLoggedInUserIsFetched } = this.props
    ensureLoggedInUserIsFetched(auth)
  }

  render () {
    const { auth, children, loggedInUser, loggedInUserRequired } = this.props

    if (auth) {
      if (loggedInUserRequired && auth.isAuthenticated && !loggedInUser) {
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
    loggedInUser: state.otp.user.loggedInUser
  }
}

const mapDispatchToProps = {
  ensureLoggedInUserIsFetched,
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLoaderScreen)
