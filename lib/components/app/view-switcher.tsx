import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'

import Link from '../util/link'

type Props = {
  sticky?: boolean
}
/**
 * This component is a switcher between
 * the main views of the application.
 */
const ViewSwitcher = ({ sticky }: Props) => {
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
      <Link to="/" tracking>
        <FormattedMessage id="components.BatchRoutingPanel.shortTitle" />
      </Link>
      <Link to="/route" tracking>
        <FormattedMessage id="components.RouteViewer.shortTitle" />
      </Link>
      <Link to="/nearby" tracking>
        <FormattedMessage id="components.ViewSwitcher.nearby" />
      </Link>
    </div>
  )
}

export default ViewSwitcher
