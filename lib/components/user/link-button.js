import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as uiActions from '../../actions/ui'

/**
 * This button provides basic redirecting functionality.
 * FIXME: Replace this component with Link (react-router-dom) or LinkContainer
 *  (react-router-bootstrap).
 */
class LinkButton extends Component {
  static propTypes = {
    componentClass: PropTypes.elementType,
    /** The destination url when clicking the button. */
    to: PropTypes.string.isRequired
  }

  _handleClick = () => {
    this.props.routeTo(this.props.to)
  }

  render () {
    const {
      children,
      componentClass: Component = Button,
      routeTo, // exclude routeTo from passedProps.
      ...passedProps
    } = this.props
    return (
      <Component
        {...passedProps}
        onClick={this._handleClick}
      >
        {children}
      </Component>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkButton)
