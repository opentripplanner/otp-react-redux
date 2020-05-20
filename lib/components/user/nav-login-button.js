import memoize from 'lodash.memoize'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {connect} from 'react-redux'
import {
  MenuItem,
  NavDropdown,
  NavItem
} from 'react-bootstrap'

import {routeTo} from '../../actions/ui'

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

    // Override bootstrap's defaults, especially for nav links.
    // HACK: Because we don't want to use the rendered <NavDropDown> inside a <Nav> while in mobile mode
    // (otherwise, the menu items get displayed full screen width, which is undesirable),
    // the CSS rules below let us fit the sign-in component to the top-right corner
    // and add some of the default visuals provided by react-bootstrap's <Nav> while in mobile mode.
    // We change the link color to white for consistency with the AppMenu component.
    const styleOverrides = (
      <style>{`
        .otp.mobile .navbar .container-fluid > li {
          display: block;
          padding: 14px;
          position: fixed;
          right: 0;
          top: 0;
        }
        .otp.mobile .navbar li.dropdown.open {
          background-color: #080808;
        }
        .navbar-inverse .navbar-nav > li > a,
        .otp.mobile .navbar .container-fluid > li > a,
        .otp.mobile .navbar .container-fluid > li.dropdown.open > a {
          color: #fff;
          text-decoration: none;
        }
        .navbar-inverse .navbar-nav > li > a:hover,
        .otp.mobile .navbar .container-fluid > li > a:hover {
          color: #ddd;
          text-decoration: none;
        }
      `}
      </style>
    )

    if (profile) {
      const displayedName = profile.nickname || profile.name
      return (
        <NavDropdown
          {...commonProps}
          pullRight
          title={<span>
            {styleOverrides}
            <img
              alt={displayedName}
              src={profile.picture}
              style={{width: '2em', height: '2em', margin: '-15px 0'}}
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

    return (
      <NavItem {...commonProps} onClick={onSignInClick}>
        {styleOverrides}
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
