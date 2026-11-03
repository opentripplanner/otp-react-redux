import { connect } from 'react-redux'
import { Envelope } from '@styled-icons/fa-regular/Envelope'
import { History } from '@styled-icons/fa-solid/History'
import { useIntl } from 'react-intl'
import React from 'react'

import * as callTakerActions from '../../actions/call-taker'
import { AppReduxState } from '../../util/state-types'
import { isModuleEnabled, Modules } from '../../util/config'
import AppMenuItem from '../app/app-menu-item'
import AppModule from '../app/app-module'

type Props = {
  mailablesEnabled?: boolean
  resetAndToggleCallHistory?: () => void
  toggleMailables: () => void
}

/**
 * Sidebar which appears to show user list of options and links
 */
const CallTakerMenuItems = ({
  mailablesEnabled,
  resetAndToggleCallHistory,
  toggleMailables
}: Props) => {
  const intl = useIntl()
  return (
    <AppModule load={['call']}>
      <AppMenuItem
        icon={<History />}
        onClick={resetAndToggleCallHistory}
        text={intl.formatMessage({
          id: 'components.CallTakerMenu.callHistory'
        })}
      />
      {mailablesEnabled && (
        <AppMenuItem
          icon={<Envelope />}
          onClick={toggleMailables}
          text={intl.formatMessage({
            id: 'components.CallTakerMenu.mailables'
          })}
        />
      )}
    </AppModule>
  )
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => ({
  mailablesEnabled: isModuleEnabled(state, Modules.MAILABLES)
})

const mapDispatchToProps = {
  resetAndToggleCallHistory: callTakerActions.resetAndToggleCallHistory,
  toggleMailables: callTakerActions.toggleMailables
}

export default connect(mapStateToProps, mapDispatchToProps)(CallTakerMenuItems)
