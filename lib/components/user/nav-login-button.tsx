import { FormattedMessage } from 'react-intl'
import { MenuItem, NavDropdown, NavItem } from 'react-bootstrap'
import { User } from '@auth0/auth0-react'
import PropTypes from 'prop-types'
import React, { Component, CSSProperties } from 'react'
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

type Link = {
  messageId: string
  target?: string
  url: string
}

type Props = {
  className?: string
  id: string
  links: Link[]
  onSignInClick: () => void
  onSignOutClick: () => void
  profile: User | null | undefined
  style?: CSSProperties | undefined
}

/**
 * This component displays the sign-in status in the nav bar.
 * - When a user is not logged in: display 'Sign In' as a link or button.
 * - When a user is logged in, display an 'avatar' (retrieved from the profile prop)
 *   and a dropdown button so the user can access more options.
 */
export default class NavLoginButton extends Component<Props> {
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

  render(): JSX.Element {
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
          title={
            <span>
              <Avatar
                alt={displayedName}
                src={profile.picture}
                title={`${displayedName}\n(${profile.email})`}
              />
            </span>
          }
        >
          <MenuItem header>{displayedName}</MenuItem>

          {links &&
            links.map((link, i) => (
              <LinkContainerWithQuery
                exact
                key={i}
                target={link.target}
                to={link.url}
              >
                <MenuItem>
                  {link.messageId === 'myAccount' ? ( // messageId is 'myAccount' or 'help'
                    <FormattedMessage id="components.NavLoginButton.myAccount" />
                  ) : (
                    <FormattedMessage id="components.NavLoginButton.help" />
                  )}
                </MenuItem>
              </LinkContainerWithQuery>
            ))}

          <MenuItem divider />

          <MenuItem onSelect={onSignOutClick}>
            <FormattedMessage id="components.NavLoginButton.signOut" />
          </MenuItem>
        </NavDropdown>
      )
    }

    // Display the sign-in link if no profile is passed (user is not logged in).
    return (
      <NavItem {...commonProps} onClick={onSignInClick}>
        <FormattedMessage id="components.NavLoginButton.signIn" />
      </NavItem>
    )
  }
}
