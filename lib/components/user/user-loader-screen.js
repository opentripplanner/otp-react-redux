import React, { Component } from 'react'
import { connect } from 'react-redux'

import { routeTo } from '../../actions/ui'
import { ensureLoggedInUserIsFetched } from '../../actions/user'
import { renderChildrenWithProps } from '../../util/ui'

import AwaitingScreen from './awaiting-screen'

/**
 * This component ensures that values under state.user are set when a user is logged in.
 * If needed by the children, this component displays a wait screen while state.user values are being fetched.
 * Upon completion (or if no user is logged in or if auth is disabled), it renders children.
 */
class UserLoaderScreen extends Component {
  async componentDidMount () {
    const { auth, ensureLoggedInUserIsFetched } = this.props
    await ensureLoggedInUserIsFetched(auth)
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
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  ensureLoggedInUserIsFetched,
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLoaderScreen)
