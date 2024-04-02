import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'

import { AppReduxState } from '../../util/state-types'
import Link from '../util/link'

type Props = {
  mainPath: string
  sticky?: boolean
}
/**
 * This component is a switcher between
 * the main views of the application.
 */
const ViewSwitcher = ({ mainPath, sticky }: Props) => {
  const intl = useIntl()
  return (
    <div
      aria-label={intl.formatMessage({
        id: 'components.ViewSwitcher.switcher'
      })}
      className="view-switcher"
      id="view-switcher"
      role="group"
      style={
        sticky
          ? {
              height: '100%',
              left: 0,
              position: 'absolute',
              width: '100%'
            }
          : {}
      }
    >
      <Link isActive={mainPath === '/'} to="/">
        <FormattedMessage id="components.BatchRoutingPanel.shortTitle" />
      </Link>
      <Link isActive={mainPath === '/route'} to="/route">
        <FormattedMessage id="components.RouteViewer.shortTitle" />
      </Link>
      <Link isActive={mainPath === '/nearby'} to="/nearby">
        <FormattedMessage id="components.ViewSwitcher.nearby" />
      </Link>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const pathParts = state.router.location.pathname.split('/')
  return {
    mainPath: `/${pathParts[1]}`
  }
}

export default connect(mapStateToProps)(ViewSwitcher)
