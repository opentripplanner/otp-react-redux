import { FormattedMessage, useIntl } from 'react-intl'
import React, { useContext } from 'react'

import { ComponentContext } from '../../util/contexts'
import Link from '../util/link'

// TODO: Move to generic types file
type ExtraView = {
  content: JSX.Element
  name?: string
  path: string
}

/**
 * This component is a switcher between
 * the main views of the application.
 */
const ViewSwitcher = (): JSX.Element => {
  const intl = useIntl()
  // @ts-expect-error Context not typed
  const { extraViews } = useContext(ComponentContext)
  return (
    <div
      aria-label={intl.formatMessage({
        id: 'components.ViewSwitcher.switcher'
      })}
      className="view-switcher"
      id="view-switcher"
      role="group"
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
      {extraViews
        .filter((v: ExtraView) => !!v?.name)
        .map((view: ExtraView) => (
          <Link key={view.path} to={view.path} tracking>
            {view.name}
          </Link>
        ))}
    </div>
  )
}

export default ViewSwitcher
