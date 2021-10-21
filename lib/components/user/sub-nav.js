import React from 'react'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { LinkContainerWithQuery } from '../form/connected-links'
import { ACCOUNT_SETTINGS_PATH, TRIPS_PATH } from '../../util/constants'

import { SubNavContainer, SubNavLinks } from './styled'

/**
 * This component renders the sub navigation elements for Account pages.
 */
const SubNav = ({ title }) => (
  <SubNavContainer>
    <div className='container'>
      <h1 style={{display: 'inline', paddingTop: '10px'}}>
        {title || (
          <FormattedMessage id='components.SubNav.myAccount' />
        )}
      </h1>
      <SubNavLinks className='pull-right'>
        <LinkContainerWithQuery to={TRIPS_PATH}>
          <Button bsStyle='link'>
            <FormattedMessage id='components.SubNav.trips' />
          </Button>
        </LinkContainerWithQuery>
        <LinkContainerWithQuery to={ACCOUNT_SETTINGS_PATH}>
          <Button bsStyle='link'>
            <FormattedMessage id='components.SubNav.settings' />
          </Button>
        </LinkContainerWithQuery>
      </SubNavLinks>
    </div>
  </SubNavContainer>
)

export default SubNav
