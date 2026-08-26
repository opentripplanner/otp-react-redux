import { connect } from 'react-redux'
import React, { ReactElement, ReactNode, useEffect } from 'react'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'

interface OwnProps {
  children: ReactNode
  name: string
}

interface Props extends OwnProps {
  isLoaded: boolean
  loadAppModule: (name: string) => void
}

/**
 * Declares a module. Content rendering is held until the module and messages are loaded.
 */
const AppModule = ({
  children,
  isLoaded,
  loadAppModule,
  name
}: Props): ReactElement | null => {
  useEffect(() => {
    loadAppModule(name)
  }, [loadAppModule, name])

  return isLoaded ? <>{children}</> : null
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  const { loadedModules, loadingMessages = false } = state.otp.ui
  const isLoaded = loadedModules.includes(ownProps.name) && !loadingMessages

  return {
    isLoaded
  }
}

const mapDispatchToProps = {
  loadAppModule: uiActions.loadAppModule
}

export default connect(mapStateToProps, mapDispatchToProps)(AppModule)
