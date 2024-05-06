/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { FormattedMessage, useIntl } from 'react-intl'
import { User } from '@auth0/auth0-react'
import { User as UserIcon } from '@styled-icons/fa-regular/User'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Dropdown } from '../util/dropdown'
import { NewWindowIconA11y } from '../util/externalLink'
import { UnstyledButton } from '../util/unstyled-button'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import NavbarItem from '../app/nav-item'

import { UnstyledLink } from './styled'

const Avatar = styled.img`
  height: 2em;
  margin: -15px 0;
  width: 2em;
`
const NavUnstyledLink = styled(UnstyledLink)`
  display: block;
`

type LinkData = {
  messageId: string
  target?: string
  url: string
}

interface Props extends HTMLAttributes<HTMLElement> {
  links: LinkData[]
  onSignInClick: () => void
  onSignOutClick: () => void
  profile?: User | null
}

/**
 * This component displays the sign-in status in the nav bar.
 * - When a user is not logged in: display 'Log In' as a link or button.
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
          pullRight
        >
          <li className="header">{displayedName}</li>

          {links &&
            links.map((link, i) => {
              if (link.url.startsWith('http')) {
                return (
                  <li key={link.url}>
                    <NavUnstyledLink href={link.url} target="_blank">
                      <FormattedMessage id="components.NavLoginButton.help" />
                      <NewWindowIconA11y
                        size={12}
                        style={{ marginLeft: '5px', marginTop: '-3px' }}
                      />
                    </NavUnstyledLink>
                  </li>
                )
              }
              return (
                <li key={link.url}>
                  <NavUnstyledLink to={link.url}>
                    {link.messageId === 'myAccount' ? ( // messageId is 'myAccount' or 'help'
                      <FormattedMessage id="components.NavLoginButton.myAccount" />
                    ) : (
                      <FormattedMessage id="components.NavLoginButton.help" />
                    )}
                  </NavUnstyledLink>
                </li>
              )
            })}

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
  const loginText = intl.formatMessage({
    id: 'components.NavLoginButton.signIn'
  })
  return (
    <NavbarItem {...commonProps} onClick={onSignInClick} title={loginText}>
      <UserIcon />
      <InvisibleA11yLabel>{loginText}</InvisibleA11yLabel>
    </NavbarItem>
  )
}

export default NavLoginButton
