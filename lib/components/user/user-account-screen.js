import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'

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

  componentDidMount () {
    // const { location, parseUrlQueryString } = this.props

    // Parse the URL query parameters, if present
    // if (location && location.search) {
    //  parseUrlQueryString()
    // }
    document.title = `My Account`
  }

  render () {
    const { isNewAccount, originalUrl } = this.props
    return (
      <div>
        <h1>
          {isNewAccount ? 'Welcome New User!' : 'Welcome Back!'}
        </h1>

        <p>
          <Button onClick={() => this.props.routeTo(originalUrl)}>
            Back to Trip Planner
          </Button>
        </p>
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

export default connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen)
