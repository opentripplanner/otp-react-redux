import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, DropdownButton, MenuItem, NavDropdown, NavItem } from 'react-bootstrap'

/**
 * This component displays the sign-in status in the nav bar.
 * - When a user is not logged in: display 'Sign In' as a link or button.
 * - When a user is logged in, display an 'avatar' retrieved from auth0 and a dropdown button so the user can access more options.
 */
export default class NavLoginButton extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.string,
      text: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    })),
    onSignInClick: PropTypes.func.isRequired,
    onSignOutClick: PropTypes.func.isRequired,
    onSignUpClick: PropTypes.func.isRequired,
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

  render () {
    const { className, id, links, onSignInClick, onSignOutClick, onSignUpClick, profile, style } = this.props
    const commonProps = {
      className,
      id,
      pullRight: true,
      style
    }

    return profile
    ? (
      <NavDropdown
        {...commonProps}
        title={<span>
            <img
              src={profile.picture}
              style={{width: '2em', height: '2em'}}
            />
          </span>}
      >
        <MenuItem header title={profile.email}>
          {profile.nickname || profile.name}
        </MenuItem>

        {links && links.map(item => (
          <MenuItem href={item.url} target={item.target}>{item.text}</MenuItem>
        ))}
        <MenuItem divider />
        <MenuItem onSelect={onSignOutClick}>Sign out</MenuItem>
      </NavDropdown>
    )
    : (
      <NavDropdown
        {...commonProps}
        title='Sign in'
      >
        <MenuItem onSelect={onSignInClick}>Sign in</MenuItem>
        <MenuItem divider />
        <MenuItem onSelect={onSignUpClick}>Create account</MenuItem>
      </NavDropdown>
    )
  }
}
