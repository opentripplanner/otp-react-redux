import React from 'react'
import { Button } from 'react-bootstrap'

import { LinkContainerWithQuery } from '../form/connected-links'
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
        <LinkContainerWithQuery to={TRIPS_PATH}>
          <Button bsStyle='link'>Trips</Button>
        </LinkContainerWithQuery>
        <LinkContainerWithQuery to={ACCOUNT_SETTINGS_PATH}>
          <Button bsStyle='link'>Settings</Button>
        </LinkContainerWithQuery>
      </SubNavLinks>
    </div>
  </SubNavContainer>
)

export default SubNav
