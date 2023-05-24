/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { FormattedMessage, useIntl } from 'react-intl'
import { NavItem } from 'react-bootstrap'
import { User } from '@auth0/auth0-react'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Dropdown } from '../util/dropdown'
import { LinkContainerWithQuery } from '../form/connected-links'
import { UnstyledButton } from '../util/unstyled-button'

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
const NavLoginButton = ({
  className,
  id,
  links,
  onSignInClick,
  onSignOutClick,
  profile,
  style
}: Props): JSX.Element => {
  const intl = useIntl()

  const commonProps = {
    className,
    id,
    style
  }

  // If a profile is passed (a user is logged in), display avatar and drop-down menu.
  if (profile) {
    const displayedName = profile.nickname || profile.name
    return (
      <li>
        <Dropdown
          id="user-selector"
          label={intl.formatMessage({ id: 'components.SubNav.userMenu' })}
          name={
            <span>
              <Avatar
                alt={displayedName}
                src={profile.picture}
                title={`${displayedName}\n(${profile.email})`}
              />
            </span>
          }
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
                  <UnstyledButton>
                    {link.messageId === 'myAccount' ? ( // messageId is 'myAccount' or 'help'
                      <FormattedMessage id="components.NavLoginButton.myAccount" />
                    ) : (
                      <FormattedMessage id="components.NavLoginButton.help" />
                    )}
                  </UnstyledButton>
                </li>
              </LinkContainerWithQuery>
            ))}

          <hr role="presentation" />

          <li>
            <UnstyledButton onClick={onSignOutClick}>
              <FormattedMessage id="components.NavLoginButton.signOut" />
            </UnstyledButton>
          </li>
        </Dropdown>
      </li>
    )
  }

  // Display the sign-in link if no profile is passed (user is not logged in).
  return (
    <NavItem {...commonProps} onClick={onSignInClick}>
      <FormattedMessage id="components.NavLoginButton.signIn" />
    </NavItem>
  )
}

export default NavLoginButton
