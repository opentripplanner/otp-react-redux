import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { action } from '@storybook/addon-actions'

import NavLoginButton from '../lib/components/user/nav-login-button'

import './index.css'

// Example data for stories.
const auth0UserBasic = {
  name: 'John Doe',
  email: 'john.doe@example.com'
}

const auth0UserFull = {
  ...auth0UserBasic,
  nickname: 'John-Oh',
  picture: 'https://s.gravatar.com/avatar/4ee0937a28227ba559f0e446435526a5?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fbi.png',
}

const defaults = {
  id: 'login1',
  links: [
    {
      target: '_blank',
      text: 'GTFS Help',
      url: 'http://www.gtfs.org'
    },
    {
      text: 'Manage account',
      url: 'http://account.example.com/'
    }
  ],
  onSignInClick: action('onSignInClick'),
  onSignOutClick: action('onSignOutClick'),
  onSignUpClick: action('onSignUpClick')
}

const decorator = story => (
  <Navbar inverse>
    <Navbar.Collapse>
      <Nav pullRight>
        {story()}
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default {
  title: 'Nav Signin Status',
  component: NavLoginButton,
  decorators: [decorator]
}

export const notLoggedIn  = () => <NavLoginButton {...defaults} />

export const loggedIn  = () => <NavLoginButton profile={auth0UserFull} {...defaults} />

export const loggedInNoPicNoNickname  = () => <NavLoginButton profile={auth0UserBasic} {...defaults} />
