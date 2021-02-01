import React from 'react'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

import { SubNavContainer, SubNavLinks } from './styled'
import { ACCOUNT_SETTINGS_PATH, TRIPS_PATH } from '../../util/constants'

/**
 * This component renders the sub navigation elements for Account pages.
 */
const SubNav = ({title = 'My account'}) => (
  <SubNavContainer>
    <div className='container'>
      <h1 style={{display: 'inline', paddingTop: '10px'}}>{title}</h1>
      <SubNavLinks className='pull-right'>
        <LinkContainer to={TRIPS_PATH}>
          <Button bsStyle='link'>Trips</Button>
        </LinkContainer>
        <LinkContainer to={ACCOUNT_SETTINGS_PATH}>
          <Button bsStyle='link'>Settings</Button>
        </LinkContainer>
      </SubNavLinks>
    </div>
  </SubNavContainer>
)

export default SubNav
