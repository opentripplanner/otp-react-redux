import memoize from 'lodash.memoize'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {connect} from 'react-redux'
import {
  MenuItem,
  NavDropdown,
  NavItem
} from 'react-bootstrap'
import styled from 'styled-components'

import { routeTo } from '../../actions/ui'

const Avatar = styled.img`
  height: 2em;
  margin: -15px 0;
  width: 2em;
`

/**
 * This component displays the sign-in status in the nav bar.
 * - When a user is not logged in: display 'Sign In' as a link or button.
 * - When a user is logged in, display an 'avatar' (retrieved from the profile prop)
 *   and a dropdown button so the user can access more options.
 */
class NavLoginButton extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.string,
      text: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    })),
    onSignInClick: PropTypes.func.isRequired,
    onSignOutClick: PropTypes.func.isRequired,
    profile: PropTypes.shape({
      email: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      nickname: PropTypes.string,
      picture: PropTypes.string
    })
  }

  static defaultProps = {
    links: null,
    profile: null
  }

  _handleLinkClick = memoize(
    item => () => this.props.routeTo(item.url)
  )

  render () {
    const {
      className,
      id,
      links,
      onSignInClick,
      onSignOutClick,
      profile,
      style
    } = this.props

    const commonProps = {
      className,
      id,
      style
    }

    // If a profile is passed (a user is logged in), display avatar and drop-down menu.
    if (profile) {
      const displayedName = profile.nickname || profile.name
      return (
        <NavDropdown
          {...commonProps}
          pullRight
          title={<span>
            <Avatar
              alt={displayedName}
              src={profile.picture}
              title={`${displayedName}\n(${profile.email})`}
            />
          </span>
          }>
          <MenuItem header>{displayedName}</MenuItem>

          {links && links.map((item, index) => (
            <MenuItem
              onSelect={this._handleLinkClick(item)}
              key={index}
              target={item.target}>
              {item.text}
            </MenuItem>
          ))}
          <MenuItem divider />
          <MenuItem onSelect={onSignOutClick}>Sign out</MenuItem>
        </NavDropdown>
      )
    }

    // Display the sign-in link if no profile is passed (user is not logged in).
    return (
      <NavItem {...commonProps} onClick={onSignInClick}>
        Sign in
      </NavItem>
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

export default connect(mapStateToProps, mapDispatchToProps)(NavLoginButton)
