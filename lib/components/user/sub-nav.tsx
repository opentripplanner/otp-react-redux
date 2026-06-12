import { FormattedMessage } from 'react-intl'
import React, { ReactNode } from 'react'

import { ACCOUNT_SETTINGS_PATH, TRIPS_PATH } from '../../util/constants'
import Link from '../util/link'

import { SubNavContainer, SubNavLinks } from './styled'

interface Props {
  title: ReactNode
}

/**
 * This component renders the sub navigation elements for Account pages.
 */
const SubNav = ({ title }: Props): JSX.Element => (
  <SubNavContainer>
    <div className="container">
      <h1 style={{ display: 'inline', paddingTop: '10px' }}>
        {title || <FormattedMessage id="components.SubNav.myAccount" />}
      </h1>
      <SubNavLinks className="pull-right">
        <Link to={TRIPS_PATH} tracking>
          <FormattedMessage id="components.SubNav.trips" />
        </Link>
        <Link to={ACCOUNT_SETTINGS_PATH} tracking>
          <FormattedMessage id="components.SubNav.settings" />
        </Link>
      </SubNavLinks>
    </div>
  </SubNavContainer>
)

export default SubNav
