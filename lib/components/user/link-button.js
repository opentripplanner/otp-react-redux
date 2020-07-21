import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import { routeTo } from '../../actions/ui'

/**
 * This button provides basic redirecting functionality.
 * FIXME: Replace this component with Link (react-router-dom) or LinkContainer (react-router-bootstrap).
 */
class LinkButton extends Component {
  static propTypes = {
    /** The destination url when clicking the button. */
    to: PropTypes.string.isRequired
  }

  _handleClick = () => {
    this.props.routeTo(this.props.to)
  }

  render () {
    return <Button onClick={this._handleClick}>{this.props.children}</Button>
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkButton)
