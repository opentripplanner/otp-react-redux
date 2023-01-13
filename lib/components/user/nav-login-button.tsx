import { FormattedMessage } from 'react-intl'
import { NavItem } from 'react-bootstrap'
import { User } from '@auth0/auth0-react'
import React, { Component, HTMLAttributes } from 'react'
import styled from 'styled-components'

import { LinkContainerWithQuery } from '../form/connected-links'
import Dropdown from '../util/dropdown'

const Avatar = styled.img`
  height: 2em;
  margin: -15px 0;
  width: 2em;
`

type Link = {
  messageId: string
  target?: string
  url: string
}

interface Props extends HTMLAttributes<HTMLElement> {
  links: Link[]
  onSignInClick: () => void
  onSignOutClick: () => void
  profile?: User | null
}

/**
 * This component displays the sign-in status in the nav bar.
 * - When a user is not logged in: display 'Sign In' as a link or button.
 * - When a user is logged in, display an 'avatar' (retrieved from the profile prop)
 *   and a dropdown button so the user can access more options.
 */
export default class NavLoginButton extends Component<Props> {
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
        <Dropdown
          id="user-selector"
          name={
            <span>
              <Avatar
                alt={displayedName}
                src={profile.picture}
                title={`${displayedName}\n(${profile.email})`}
              />
            </span>
          }
          pullRight
        >
          <li className="header">{displayedName}</li>

          {links &&
            links.map((link, i) => (
              <LinkContainerWithQuery
                exact
                key={i}
                target={link.target}
                to={link.url}
              >
                <li>
                  {link.messageId === 'myAccount' ? ( // messageId is 'myAccount' or 'help'
                    <FormattedMessage id="components.NavLoginButton.myAccount" />
                  ) : (
                    <FormattedMessage id="components.NavLoginButton.help" />
                  )}
                </li>
              </LinkContainerWithQuery>
            ))}

          <hr role="presentation" />

          <li onSelect={onSignOutClick}>
            <FormattedMessage id="components.NavLoginButton.signOut" />
          </li>
        </Dropdown>
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
