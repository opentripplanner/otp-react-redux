import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { MenuItem, NavDropdown, NavItem } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'

import { LinkContainerWithQuery } from '../form/connected-links'

const Avatar = styled.img`
  height: 2em;
  margin: -15px 0;
  width: 2em;
`

const linkType = PropTypes.shape({
  messageId: PropTypes.string.isRequired,
  target: PropTypes.string,
  url: PropTypes.string.isRequired
})

/**
 * This component displays the sign-in status in the nav bar.
 * - When a user is not logged in: display 'Sign In' as a link or button.
 * - When a user is logged in, display an 'avatar' (retrieved from the profile prop)
 *   and a dropdown button so the user can access more options.
 */
export default class NavLoginButton extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(linkType),
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

          {links && links.map((link, i) => (
            <LinkContainerWithQuery exact key={i} target={link.target} to={link.url}>
              <MenuItem>
                <FormattedMessage id={link.messageId} />
              </MenuItem>
            </LinkContainerWithQuery>
          ))}

          <MenuItem divider />

          <MenuItem onSelect={onSignOutClick}>
            <FormattedMessage id='components.NavLoginButton.signOut' />
          </MenuItem>
        </NavDropdown>
      )
    }

    // Display the sign-in link if no profile is passed (user is not logged in).
    return (
      <NavItem {...commonProps} onClick={onSignInClick}>
        <FormattedMessage id='components.NavLoginButton.signIn' />
      </NavItem>
    )
  }
}
