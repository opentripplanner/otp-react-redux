import { connect } from 'react-redux'
import React, { ReactElement, ReactNode, useEffect } from 'react'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'

interface OwnProps {
  children?: ReactNode
  load: string | string[]
}

interface Props extends OwnProps {
  isLoaded: boolean
  loadAppModules: (appModules: string[]) => void
}

/**
 * Declares one or several modules.
 * Each module groups and loads i18n messages dynamically
 * and also serves as an abstract set of code and features.
 * Content rendering is held until the module and messages are loaded.
 */
const AppModule = ({
  children,
  isLoaded,
  load: moduleNames,
  loadAppModules
}: Props): ReactElement | null => {
  useEffect(() => {
    const moduleList =
      typeof moduleNames === 'string' ? [moduleNames] : moduleNames
    loadAppModules(moduleList)
  }, [loadAppModules, moduleNames])

  return isLoaded && children ? <>{children}</> : null
}

// connect to the redux store

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => ({
  isLoaded: uiActions.areModulesLoaded(state, ownProps.load)
})

const mapDispatchToProps = {
  loadAppModules: uiActions.loadAppModules
}

export default connect(mapStateToProps, mapDispatchToProps)(AppModule)
