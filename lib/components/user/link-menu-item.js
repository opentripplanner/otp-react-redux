import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MenuItem } from 'react-bootstrap'

import { routeTo } from '../../actions/ui'

export const linkType = PropTypes.shape({
  target: PropTypes.string,
  text: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
})

/**
 * This component displays a react-bootstrap MenuItem for a link entry,
 * and routes to the path provided by the link when the MenuItem's onSelect event is triggered.
 */
class LinkMenuItem extends Component {
  static propTypes = {
    link: linkType.isRequired
  }

  _handleClick = () => {
    const { link, routeTo } = this.props
    routeTo(link.url)
  }

  render () {
    const { link } = this.props
    const { target, text } = link

    return (
      <MenuItem onSelect={this._handleClick} target={target}>
        {text}
      </MenuItem>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkMenuItem)
