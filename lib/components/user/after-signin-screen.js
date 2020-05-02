import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'

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
      </div>
    )
  }
}

export default AfterSignIn
